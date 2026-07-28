import {
  createEmptyEchoState,
  type EchoRepository,
  type EchoRepositoryState,
  type PersistedEchoDecision
} from "./repository";

const STORAGE_KEY = "lets-collect-echo-v1";
const validDecisions = new Set<PersistedEchoDecision>([
  "left",
  "drifted",
  "mutual"
]);

let memoryState: EchoRepositoryState | null = null;

function cloneState(state: EchoRepositoryState): EchoRepositoryState {
  return {
    ...state,
    decisions: { ...state.decisions },
    taskProgress: { ...state.taskProgress }
  };
}

function parseState(
  value: string | null,
  dateKey: string
): EchoRepositoryState {
  if (!value) return createEmptyEchoState(dateKey);

  try {
    const parsed = JSON.parse(value) as Partial<EchoRepositoryState>;
    if (parsed.dateKey !== dateKey) return createEmptyEchoState(dateKey);

    const decisions = Object.fromEntries(
      Object.entries(parsed.decisions ?? {}).filter(
        (entry): entry is [string, PersistedEchoDecision] =>
          validDecisions.has(entry[1] as PersistedEchoDecision)
      )
    );
    const taskProgress = Object.fromEntries(
      Object.entries(parsed.taskProgress ?? {}).filter(
        (entry): entry is [string, number] =>
          typeof entry[1] === "number"
          && Number.isFinite(entry[1])
          && entry[1] >= 0
      )
    );

    return {
      dateKey,
      decisions,
      taskProgress,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString()
    };
  } catch {
    return createEmptyEchoState(dateKey);
  }
}

export class LocalEchoRepository implements EchoRepository {
  async load(dateKey: string) {
    try {
      const state = parseState(window.localStorage.getItem(STORAGE_KEY), dateKey);
      memoryState = cloneState(state);
      return state;
    } catch {
      if (memoryState?.dateKey === dateKey) return cloneState(memoryState);
      const state = createEmptyEchoState(dateKey);
      memoryState = cloneState(state);
      return state;
    }
  }

  async save(state: EchoRepositoryState) {
    const nextState = {
      ...cloneState(state),
      updatedAt: new Date().toISOString()
    };
    memoryState = cloneState(nextState);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // Echo remains usable in memory when private browsing blocks storage.
    }
  }
}
