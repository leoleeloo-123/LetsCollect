import {
  evolutionCampaignDrafts,
  evolutionInsights,
  evolutionSignals
} from "../../data/mock/evolution";
import type {
  CampaignProposal,
  EvolutionConsoleSnapshot
} from "../../types/agent";
import { analytics } from "../analytics";
import { assessCampaignFeasibility } from "./feasibility";

const EVOLUTION_STAGES = [
  "observe",
  "reason",
  "propose",
  "approve",
  "measure"
] as const;

function buildProposal(
  draft: (typeof evolutionCampaignDrafts)[number]
): CampaignProposal {
  const feasibility = assessCampaignFeasibility(draft);
  return {
    ...draft,
    feasibility,
    status: feasibility.status === "requires_asset_creation" ? "roadmap" : "proposed"
  };
}

export function createEvolutionConsoleSnapshot(): EvolutionConsoleSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    observationWindow: "Aggregated demo signals · last 7 days",
    stages: EVOLUTION_STAGES,
    signals: evolutionSignals,
    insights: evolutionInsights,
    proposals: evolutionCampaignDrafts.map(buildProposal)
  };
}

export async function recordProposalViewed(proposal: CampaignProposal) {
  await analytics.track("agent_proposal_viewed", {
    proposalId: proposal.id,
    feasibility: proposal.feasibility.status
  });
}

export async function approveCampaignProposal(
  proposal: CampaignProposal
): Promise<CampaignProposal> {
  if (!proposal.feasibility.canApprove) {
    await analytics.track("agent_proposal_blocked", {
      proposalId: proposal.id,
      feasibility: proposal.feasibility.status
    });
    throw new Error("This proposal cannot be approved with current capabilities.");
  }

  await analytics.track("agent_proposal_approved", {
    proposalId: proposal.id,
    previousStatus: proposal.status
  });

  return {
    ...proposal,
    status: "approved"
  };
}
