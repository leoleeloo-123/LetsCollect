import type {
  AgentInsight,
  CampaignProposalDraft,
  CommunitySignal
} from "../../types/agent";

export const evolutionSignals = [
  {
    id: "signal_calm_palette_share",
    label: "Calm palette share",
    value: 34,
    unit: "percent",
    displayValue: "34%",
    deltaLabel: "+12% vs. prior 7 days",
    trend: "up",
    period: "Last 7 days",
    description: "Candy Mint and Lime appeared more often in recently collected matte Companions."
  },
  {
    id: "signal_matte_model_breadth",
    label: "Matte model breadth",
    value: 4.2,
    unit: "ratio",
    displayValue: "4.2 / 6",
    deltaLabel: "+0.6 models",
    trend: "up",
    period: "Last 7 days",
    description: "Active demo collectors encountered a wider mix of the six current matte models."
  },
  {
    id: "signal_crystal_draw_share",
    label: "Crystal encounter share",
    value: 5.1,
    unit: "percent",
    displayValue: "5.1%",
    deltaLabel: "Near the configured 5%",
    trend: "steady",
    period: "Last 7 days",
    description: "Diamond Unicorn remains a rare, single-model special exhibit."
  }
] as const satisfies readonly CommunitySignal[];

export const evolutionInsights = [
  {
    id: "insight_calm_green",
    title: "A calm-green moment is emerging",
    summary: "Recent demo collections are leaning toward Candy Mint and Lime without narrowing interest to a single matte model.",
    evidenceSignalIds: ["signal_calm_palette_share", "signal_matte_model_breadth"],
    confidence: "high"
  },
  {
    id: "insight_crystal_boundary",
    title: "Keep crystal communication specific",
    summary: "Crystal interest can be acknowledged, but the current product has one crystal Companion only: Diamond Unicorn.",
    evidenceSignalIds: ["signal_crystal_draw_share"],
    confidence: "high"
  }
] as const satisfies readonly AgentInsight[];

export const evolutionCampaignDrafts = [
  {
    id: "campaign_calm_green_week",
    title: "Calm Green Week",
    insight: "Use a temporary palette emphasis across all six current matte models.",
    sourceInsightIds: ["insight_calm_green"],
    targetAudience: "Collectors recently drawn to Candy Mint or Lime",
    requiredCapabilities: [
      "matte_companion_models",
      "matte_color_variants",
      "local_draw_flow",
      "local_collection_flow",
      "campaign_configuration",
      "shared_collection_tasks",
      "extra_draw_rewards"
    ],
    eligibleAssetIds: [
      "color-otter",
      "color-bird",
      "color-teddy",
      "color-bunny",
      "color-cat",
      "color-panda"
    ],
    featuredColorIds: ["candy-mint", "lime"],
    configurationChanges: [
      {
        key: "color_weight",
        target: "candy-mint",
        value: 1.35,
        explanation: "Temporarily emphasize an existing approved color."
      },
      {
        key: "color_weight",
        target: "lime",
        value: 1.2,
        explanation: "Support the same calm-green theme without excluding other colors."
      },
      {
        key: "banner_copy",
        target: "collect",
        value: "A quieter shade is passing through this week.",
        explanation: "Use calm campaign language without urgency or countdown pressure."
      }
    ],
    sharedTask: {
      type: "collect_palette",
      label: "Together, collect two calm-green matte Companions.",
      target: 2
    },
    reward: {
      type: "extra_draw",
      label: "One extra Companion encounter"
    },
    durationDays: 7,
    evaluationMetrics: [
      {
        id: "metric_green_collection_share",
        label: "Calm-green collection share",
        targetDirection: "increase"
      },
      {
        id: "metric_shared_task_completion",
        label: "Shared task completion",
        targetDirection: "increase"
      },
      {
        id: "metric_model_breadth",
        label: "Matte model breadth",
        targetDirection: "hold"
      }
    ]
  },
  {
    id: "campaign_sleepy_crystal_night",
    title: "Sleepy Crystal Night",
    roadmapLabel: "Roadmap Proposal",
    insight: "A future quiet-night theme could combine a Sleepy silhouette with crystal treatment.",
    sourceInsightIds: ["insight_crystal_boundary"],
    targetAudience: "Future collectors interested in quiet crystal themes",
    requiredCapabilities: [
      "sleepy_companion_assets",
      "more_crystal_companions",
      "badge_rewards",
      "campaign_configuration"
    ],
    eligibleAssetIds: [],
    featuredColorIds: [],
    configurationChanges: [
      {
        key: "banner_copy",
        target: "future-brief",
        value: "Sleepy Crystal Night",
        explanation: "Creative brief only; it cannot be exposed as a current campaign."
      }
    ],
    sharedTask: {
      type: "collect_material",
      label: "Future task: collect two Sleepy crystal Companions.",
      target: 2
    },
    reward: {
      type: "badge",
      label: "Future Quiet Night badge"
    },
    durationDays: 7,
    evaluationMetrics: [
      {
        id: "metric_future_interest",
        label: "Future concept interest",
        targetDirection: "increase"
      }
    ]
  }
] as const satisfies readonly CampaignProposalDraft[];
