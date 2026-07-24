import { echoCandidateFixtures } from "../../data/mock/echoCandidates";
import type {
  CollectTogetherTask,
  DailyEchoCollection,
  EchoActionResult,
  EchoCandidate,
  EchoCandidateFixture,
  ResonanceContext
} from "../../types/echo";
import { analytics } from "../analytics";
import {
  DeterministicResonanceService,
  type ResonanceService
} from "../resonance";
import { LocalEchoRepository } from "./localEchoRepository";
import type {
  EchoRepository,
  EchoRepositoryState,
  PersistedEchoDecision
} from "./repository";

const DAILY_LIMIT = 3;

type DateProvider = () => Date;

type EchoServiceOptions = {
  repository: EchoRepository;
  resonanceService: ResonanceService;
  fixtures: EchoCandidateFixture[];
  now?: DateProvider;
};

export interface EchoService {
  getDailyEchoes(context: ResonanceContext): Promise<DailyEchoCollection>;
  leaveEcho(
    candidateId: string,
    context: ResonanceContext
  ): Promise<EchoActionResult>;
  letDrift(
    candidateId: string,
    context: ResonanceContext
  ): Promise<EchoActionResult>;
  advanceCollectTogether(
    taskId: string,
    context: ResonanceContext
  ): Promise<DailyEchoCollection>;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function chooseDailyFixtures(
  fixtures: EchoCandidateFixture[],
  dateKey: string
) {
  if (fixtures.length <= DAILY_LIMIT) return [...fixtures];
  const start = stableHash(dateKey) % fixtures.length;
  return Array.from(
    { length: DAILY_LIMIT },
    (_, index) => fixtures[(start + index) % fixtures.length]
  );
}

function buildTask(
  dateKey: string,
  fixture: EchoCandidateFixture,
  state: EchoRepositoryState
): CollectTogetherTask {
  const id = `${dateKey}:${fixture.collectTogether.id}`;
  const storedProgress = state.taskProgress[id];
  const progress = Math.min(
    fixture.collectTogether.targetCount,
    Math.max(
      fixture.collectTogether.initialProgress,
      storedProgress ?? fixture.collectTogether.initialProgress
    )
  );

  return {
    id,
    candidateId: fixture.id,
    title: fixture.collectTogether.title,
    description: fixture.collectTogether.description,
    eligiblePaletteIds: [...fixture.collectTogether.eligiblePaletteIds],
    progress,
    targetCount: fixture.collectTogether.targetCount,
    rewardLabel: fixture.collectTogether.rewardLabel,
    status:
      progress >= fixture.collectTogether.targetCount ? "completed" : "active"
  };
}

export class DeterministicEchoService implements EchoService {
  private readonly repository: EchoRepository;
  private readonly resonanceService: ResonanceService;
  private readonly fixtures: EchoCandidateFixture[];
  private readonly now: DateProvider;

  constructor({
    repository,
    resonanceService,
    fixtures,
    now = () => new Date()
  }: EchoServiceOptions) {
    this.repository = repository;
    this.resonanceService = resonanceService;
    this.fixtures = fixtures;
    this.now = now;
  }

  async getDailyEchoes(context: ResonanceContext) {
    const dateKey = localDateKey(this.now());
    const state = await this.repository.load(dateKey);
    return this.buildDay(dateKey, state, context);
  }

  async leaveEcho(candidateId: string, context: ResonanceContext) {
    return this.decide(candidateId, "left", context);
  }

  async letDrift(candidateId: string, context: ResonanceContext) {
    return this.decide(candidateId, "drifted", context);
  }

  async advanceCollectTogether(
    taskId: string,
    context: ResonanceContext
  ) {
    const dateKey = localDateKey(this.now());
    const state = await this.repository.load(dateKey);
    const day = this.buildDay(dateKey, state, context);
    const task = day.collectTogetherTask;

    if (!task || task.id !== taskId) return day;

    const nextProgress = Math.min(task.targetCount, task.progress + 1);
    state.taskProgress[task.id] = nextProgress;
    await this.repository.save(state);
    await analytics.track("shared_task_progressed", {
      taskId: task.id,
      combinedProgress: nextProgress,
      target: task.targetCount
    });
    if (nextProgress >= task.targetCount && task.status !== "completed") {
      await analytics.track("shared_task_completed", {
        taskId: task.id,
        rewardType: "extra_draw"
      });
    }
    return this.buildDay(dateKey, state, context);
  }

  private async decide(
    candidateId: string,
    requestedDecision: "left" | "drifted",
    context: ResonanceContext
  ): Promise<EchoActionResult> {
    const dateKey = localDateKey(this.now());
    const state = await this.repository.load(dateKey);
    const selected = chooseDailyFixtures(this.fixtures, dateKey);
    const fixture = selected.find((candidate) => candidate.id === candidateId);

    if (!fixture) throw new Error("This Echo is not available today.");

    const existing = state.decisions[candidateId];
    if (existing) {
      return {
        day: this.buildDay(dateKey, state, context),
        decision: existing
      };
    }

    let decision: PersistedEchoDecision = requestedDecision;
    const alreadyMutual = Object.values(state.decisions).includes("mutual");
    if (requestedDecision === "left" && !alreadyMutual) {
      decision = "mutual";
      const taskId = `${dateKey}:${fixture.collectTogether.id}`;
      state.taskProgress[taskId] = fixture.collectTogether.initialProgress;
    }

    state.decisions[candidateId] = decision;
    await this.repository.save(state);

    if (requestedDecision === "left") {
      await analytics.track("echo_left", {
        echoId: candidateId,
        signalType: "glow"
      });
    } else {
      await analytics.track("echo_drifted", { echoId: candidateId });
    }
    if (decision === "mutual") {
      const taskId = `${dateKey}:${fixture.collectTogether.id}`;
      await analytics.track("echo_mutual", { echoId: candidateId });
      await analytics.track("shared_task_started", {
        taskId,
        taskType: "collect_palette"
      });
    }

    return {
      day: this.buildDay(dateKey, state, context),
      decision
    };
  }

  private buildDay(
    dateKey: string,
    state: EchoRepositoryState,
    context: ResonanceContext
  ): DailyEchoCollection {
    const selected = chooseDailyFixtures(this.fixtures, dateKey);
    const generatedAt = `${dateKey}T12:00:00.000Z`;
    const candidates: EchoCandidate[] = selected.map((fixture) => ({
      id: fixture.id,
      anonymousName: fixture.anonymousName,
      representativeCompanions: fixture.representativeCompanions.map((toy) => ({
        ...toy,
        appearance: { ...toy.appearance },
        materialTraits: { ...toy.materialTraits }
      })),
      resonance: this.resonanceService.createResult(
        fixture,
        generatedAt,
        context
      ),
      decision: state.decisions[fixture.id] ?? "pending"
    }));
    const mutualFixture = selected.find(
      (fixture) => state.decisions[fixture.id] === "mutual"
    );

    return {
      dateKey,
      dailyLimit: DAILY_LIMIT,
      remaining: candidates.filter(
        (candidate) => candidate.decision === "pending"
      ).length,
      candidates,
      collectTogetherTask: mutualFixture
        ? buildTask(dateKey, mutualFixture, state)
        : null
    };
  }
}

export const echoService: EchoService = new DeterministicEchoService({
  repository: new LocalEchoRepository(),
  resonanceService: new DeterministicResonanceService(),
  fixtures: echoCandidateFixtures
});
