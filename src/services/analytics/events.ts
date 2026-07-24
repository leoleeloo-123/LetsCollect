import type {
  CampaignFeasibility,
  CampaignProposalStatus
} from "../../types/agent";
import type { CurrentAssetId, CurrentMaterialType } from "../../config/capabilityRegistry";
import type { ToyPaletteId } from "../../types/toy";

export type AnalyticsEventPayloadMap = {
  draw_started: {
    poolId: string;
    campaignId?: string;
  };
  companion_drawn: {
    modelId: CurrentAssetId;
    colorId: ToyPaletteId;
    material: CurrentMaterialType;
    campaignId?: string;
  };
  companion_collected: {
    modelId: CurrentAssetId;
    colorId: ToyPaletteId;
    material: CurrentMaterialType;
    source: "draw" | "starter" | "campaign";
  };
  companion_skipped: {
    modelId: CurrentAssetId;
    colorId: ToyPaletteId;
    material: CurrentMaterialType;
  };
  companion_favorited: {
    modelId: CurrentAssetId;
    colorId: ToyPaletteId;
    material: CurrentMaterialType;
    isFavorite: boolean;
  };
  representative_set: {
    modelId: CurrentAssetId;
    slot: 1 | 2 | 3;
  };
  color_preference_selected: {
    colorIds: readonly ToyPaletteId[];
  };
  material_preference_selected: {
    material: CurrentMaterialType;
  };
  echo_viewed: {
    echoId: string;
    reasonCodes: readonly string[];
  };
  echo_left: {
    echoId: string;
    signalType: "star" | "companion_mark" | "glow";
  };
  echo_drifted: {
    echoId: string;
  };
  echo_mutual: {
    echoId: string;
  };
  shared_task_started: {
    taskId: string;
    taskType: "collect_palette" | "collect_material" | "complete_draw";
  };
  shared_task_progressed: {
    taskId: string;
    combinedProgress: number;
    target: number;
  };
  shared_task_completed: {
    taskId: string;
    rewardType: "extra_draw" | "badge" | "existing_color_unlock" | "collection_frame";
  };
  campaign_exposed: {
    campaignId: string;
  };
  campaign_joined: {
    campaignId: string;
  };
  campaign_completed: {
    campaignId: string;
  };
  agent_proposal_viewed: {
    proposalId: string;
    feasibility: CampaignFeasibility;
  };
  agent_proposal_approved: {
    proposalId: string;
    previousStatus: CampaignProposalStatus;
  };
  agent_proposal_blocked: {
    proposalId: string;
    feasibility: CampaignFeasibility;
  };
};

export type AnalyticsEventName = keyof AnalyticsEventPayloadMap;

export type AnalyticsEvent<Name extends AnalyticsEventName> = {
  id: string;
  name: Name;
  occurredAt: string;
  schemaVersion: 1;
  payload: AnalyticsEventPayloadMap[Name];
};

export type AnyAnalyticsEvent = {
  [Name in AnalyticsEventName]: AnalyticsEvent<Name>;
}[AnalyticsEventName];

export interface AnalyticsAdapter {
  track<Name extends AnalyticsEventName>(
    name: Name,
    payload: AnalyticsEventPayloadMap[Name]
  ): Promise<AnalyticsEvent<Name>>;
  list(): Promise<readonly AnyAnalyticsEvent[]>;
  clear(): Promise<void>;
}
