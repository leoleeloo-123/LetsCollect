import type { CapabilityId, CurrentAssetId } from "../config/capabilityRegistry";
import type { ToyPaletteId } from "./toy";

export type EvolutionStage = "observe" | "reason" | "propose" | "approve" | "measure";
export type SignalTrend = "up" | "down" | "steady";
export type SignalUnit = "percent" | "count" | "ratio";

export type CommunitySignal = {
  id: string;
  label: string;
  value: number;
  unit: SignalUnit;
  displayValue: string;
  deltaLabel: string;
  trend: SignalTrend;
  period: string;
  description: string;
};

export type AgentInsight = {
  id: string;
  title: string;
  summary: string;
  evidenceSignalIds: readonly string[];
  confidence: "low" | "medium" | "high";
};

export type CampaignFeasibility =
  | "available_now"
  | "requires_configuration"
  | "requires_asset_creation"
  | "requires_engineering";

export type CampaignProposalStatus = "proposed" | "approved" | "roadmap" | "archived";

export type CampaignConfigurationChange = {
  key: "color_weight" | "material_weight" | "draw_weight" | "banner_copy";
  target: string;
  value: string | number;
  explanation: string;
};

export type SharedTaskDefinition = {
  type: "collect_palette" | "collect_material" | "complete_draw";
  label: string;
  target: number;
};

export type CampaignReward = {
  type: "extra_draw" | "badge" | "existing_color_unlock" | "collection_frame";
  label: string;
};

export type CampaignMetric = {
  id: string;
  label: string;
  targetDirection: "increase" | "decrease" | "hold";
};

export type CampaignProposalDraft = {
  id: string;
  title: string;
  insight: string;
  sourceInsightIds: readonly string[];
  targetAudience: string;
  requiredCapabilities: readonly CapabilityId[];
  eligibleAssetIds: readonly CurrentAssetId[];
  featuredColorIds: readonly ToyPaletteId[];
  configurationChanges: readonly CampaignConfigurationChange[];
  sharedTask: SharedTaskDefinition;
  reward: CampaignReward;
  durationDays: number;
  evaluationMetrics: readonly CampaignMetric[];
  roadmapLabel?: string;
};

export type FeasibilityAssessment = {
  status: CampaignFeasibility;
  canApprove: boolean;
  canPublish: boolean;
  reasons: readonly string[];
};

export type CampaignProposal = CampaignProposalDraft & {
  feasibility: FeasibilityAssessment;
  status: CampaignProposalStatus;
};

export type EvolutionConsoleSnapshot = {
  generatedAt: string;
  observationWindow: string;
  stages: readonly EvolutionStage[];
  signals: readonly CommunitySignal[];
  insights: readonly AgentInsight[];
  proposals: readonly CampaignProposal[];
};
