import type { TastePreferences } from "./taste";
import type {
  Collectible,
  ToyMaterialId,
  ToyModelId,
  ToyPaletteId
} from "./toy";

export type ResonanceSignalKind =
  | "model"
  | "palette"
  | "material"
  | "representative"
  | "trajectory"
  | "preference";

export type ResonanceSignal = {
  id: string;
  kind: ResonanceSignalKind;
  sourceModelIds: ToyModelId[];
  sourcePaletteIds: ToyPaletteId[];
  sourceMaterialIds: ToyMaterialId[];
  summary: string;
  detail: string;
};

export type ResonanceContext = {
  collection: readonly Collectible[];
  favoriteIds: readonly string[];
  representativeIds: readonly string[];
  tastePreferences: TastePreferences;
};

export type ResonanceResult = {
  candidateId: string;
  anonymousName: string;
  representativeCompanions: Collectible[];
  sharedSignals: ResonanceSignal[];
  primaryReason: string;
  secondaryReason?: string;
  internalScore: number;
  confidence: number;
  generatedAt: string;
};

export type CollectTogetherSeed = {
  id: string;
  title: string;
  description: string;
  eligiblePaletteIds: ToyPaletteId[];
  targetCount: number;
  initialProgress: number;
  rewardLabel: string;
};

export type EchoCandidateFixture = {
  id: string;
  anonymousName: string;
  representativeCompanions: Collectible[];
  sharedSignals: ResonanceSignal[];
  collectTogether: CollectTogetherSeed;
};

export type EchoDecision = "pending" | "left" | "drifted" | "mutual";

export type EchoCandidate = {
  id: string;
  anonymousName: string;
  representativeCompanions: Collectible[];
  resonance: ResonanceResult;
  decision: EchoDecision;
};

export type CollectTogetherTask = {
  id: string;
  candidateId: string;
  title: string;
  description: string;
  eligiblePaletteIds: ToyPaletteId[];
  progress: number;
  targetCount: number;
  rewardLabel: string;
  status: "active" | "completed";
};

export type DailyEchoCollection = {
  dateKey: string;
  dailyLimit: number;
  remaining: number;
  candidates: EchoCandidate[];
  collectTogetherTask: CollectTogetherTask | null;
};

export type EchoActionResult = {
  day: DailyEchoCollection;
  decision: Exclude<EchoDecision, "pending">;
};
