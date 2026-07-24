import type {
  CampaignFeasibility,
  EvolutionStage
} from "../types/agent";

export const agentConsoleCopy = {
  eyebrow: "Internal demo · Evolution Agent",
  title: "Observe softly. Change deliberately.",
  description: "Aggregated, anonymous collection signals become explainable campaign proposals. Nothing publishes without a human decision.",
  fixtureNotice: "Demo signal adapter · no personal profiles, photos, messages, or precise location",
  currentBoundary: "Current asset boundary",
  currentBoundaryValue: "6 matte Companions · 1 Crystal Unicorn",
  observe: "Community Signals",
  reason: "Agent Insight",
  propose: "Campaign Proposals",
  measure: "Measurement Plan",
  approve: "Approve configuration",
  approved: "Approved for configuration",
  blocked: "Cannot approve",
  approvalNote: "Approval records a demo decision. It does not publish a campaign or alter production draw weights.",
  roadmapNote: "Roadmap proposals remain creative briefs until every required asset and capability exists."
} as const;

export const evolutionStageCopy = {
  observe: {
    label: "Observe",
    description: "Aggregate non-sensitive behavior"
  },
  reason: {
    label: "Reason",
    description: "Explain the pattern"
  },
  propose: {
    label: "Propose",
    description: "Draft a bounded campaign"
  },
  approve: {
    label: "Human Approve",
    description: "Keep control with a person"
  },
  measure: {
    label: "Measure",
    description: "Compare the intended outcome"
  }
} as const satisfies Record<EvolutionStage, { label: string; description: string }>;

export const feasibilityCopy = {
  available_now: {
    label: "Available now",
    description: "Uses capabilities and assets already available."
  },
  requires_configuration: {
    label: "Requires configuration",
    description: "Uses current assets, with an explicit implementation handoff."
  },
  requires_asset_creation: {
    label: "Requires new assets",
    description: "Roadmap only. Direct approval and publishing are disabled."
  },
  requires_engineering: {
    label: "Requires engineering",
    description: "A missing platform capability blocks approval."
  }
} as const satisfies Record<CampaignFeasibility, { label: string; description: string }>;
