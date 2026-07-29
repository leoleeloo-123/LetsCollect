import { generateCollectible } from "../../features/toys/generator";
import type {
  CollectTogetherSeed,
  EchoCandidateFixture,
  ResonanceSignal
} from "../../types/echo";
import type { ToyModelId, ToyPaletteId } from "../../types/toy";

type RepresentativeInput = {
  id: string;
  modelId: ToyModelId;
  paletteId: ToyPaletteId;
  seed: number;
};

function representative({
  id,
  modelId,
  paletteId,
  seed
}: RepresentativeInput) {
  return generateCollectible({
    id: `echo_${id}`,
    publicCode: `LC-ECHO-${id.toUpperCase()}`,
    modelId,
    paletteId,
    seed,
    createdAt: "2026-07-24T08:00:00.000Z"
  });
}

function signal(
  value: Omit<ResonanceSignal, "sourceMaterialIds">
    & { sourceMaterialIds?: ResonanceSignal["sourceMaterialIds"] }
): ResonanceSignal {
  return {
    ...value,
    sourceMaterialIds: value.sourceMaterialIds ?? ["plastic"]
  };
}

function task(value: CollectTogetherSeed) {
  return value;
}

export const echoCandidateFixtures: EchoCandidateFixture[] = [
  {
    id: "moss-window",
    anonymousName: "Moss Window",
    representativeCompanions: [
      representative({
        id: "moss-otter",
        modelId: "color-otter",
        paletteId: "candy-mint",
        seed: 4101
      }),
      representative({
        id: "moss-bird",
        modelId: "color-bird",
        paletteId: "lime",
        seed: 4102
      }),
      representative({
        id: "moss-koala",
        modelId: "color-koala",
        paletteId: "candy-mint",
        seed: 4103
      })
    ],
    sharedSignals: [
      signal({
        id: "moss-quiet-greens",
        kind: "palette",
        sourceModelIds: ["color-otter", "color-bird"],
        sourcePaletteIds: ["candy-mint", "lime"],
        summary: "Quiet green colorways",
        detail: "Both collections keep returning to soft mint and gentle green accents."
      }),
      signal({
        id: "moss-small-objects",
        kind: "representative",
        sourceModelIds: ["color-otter", "color-bird"],
        sourcePaletteIds: ["candy-mint", "lime"],
        summary: "Small details as signatures",
        detail: "You both chose Companions whose tiny carried objects hold the strongest color."
      }),
      signal({
        id: "moss-accessory-focus",
        kind: "representative",
        sourceModelIds: ["color-koala"],
        sourcePaletteIds: ["candy-mint"],
        summary: "A shared accessory focus",
        detail: "A mint sleep cap becomes a small, calm signature in both collecting paths."
      })
    ],
    collectTogether: task({
      id: "two-quiet-greens",
      title: "Two quiet greens",
      description: "Together, notice two Companion moments in mint or lime.",
      eligiblePaletteIds: ["candy-mint", "lime"],
      targetCount: 2,
      initialProgress: 1,
      rewardLabel: "One extra Companion encounter"
    })
  },
  {
    id: "paper-moon",
    anonymousName: "Paper Moon",
    representativeCompanions: [
      representative({
        id: "moon-bunny",
        modelId: "color-bunny",
        paletteId: "sky",
        seed: 4201
      }),
      representative({
        id: "moon-cat",
        modelId: "color-cat",
        paletteId: "berry",
        seed: 4202
      }),
      representative({
        id: "moon-owl",
        modelId: "color-owl",
        paletteId: "sky",
        seed: 4203
      })
    ],
    sharedSignals: [
      signal({
        id: "moon-cool-colors",
        kind: "palette",
        sourceModelIds: ["color-bunny", "color-cat"],
        sourcePaletteIds: ["sky", "berry"],
        summary: "Cool colors with room to breathe",
        detail: "Your recent choices both lean toward sky blue and quiet berry tones."
      }),
      signal({
        id: "moon-academic-accent",
        kind: "representative",
        sourceModelIds: ["color-owl"],
        sourcePaletteIds: ["sky"],
        summary: "A quiet academic accent",
        detail: "A sky-blue academic accessory adds one calm focal point to each collection."
      })
    ],
    collectTogether: task({
      id: "blue-hour",
      title: "A shared blue hour",
      description: "Together, notice two sky or berry color moments.",
      eligiblePaletteIds: ["sky", "berry"],
      targetCount: 2,
      initialProgress: 1,
      rewardLabel: "One extra Companion encounter"
    })
  },
  {
    id: "apricot-thread",
    anonymousName: "Apricot Thread",
    representativeCompanions: [
      representative({
        id: "thread-penguin",
        modelId: "color-penguin",
        paletteId: "apricot",
        seed: 4301
      }),
      representative({
        id: "thread-cat",
        modelId: "color-cat",
        paletteId: "cream-rose",
        seed: 4302
      }),
      representative({
        id: "thread-otter",
        modelId: "color-otter",
        paletteId: "cocoa",
        seed: 4303
      })
    ],
    sharedSignals: [
      signal({
        id: "thread-warm-matte",
        kind: "material",
        sourceModelIds: ["color-penguin", "color-cat", "color-otter"],
        sourcePaletteIds: ["apricot", "cream-rose", "cocoa"],
        summary: "Warm matte companions",
        detail: "Both collections favor warm, softly finished Companions over brighter contrasts."
      }),
      signal({
        id: "thread-gentle-warmth",
        kind: "trajectory",
        sourceModelIds: ["color-penguin", "color-cat"],
        sourcePaletteIds: ["apricot", "cream-rose"],
        summary: "A gentle warming path",
        detail: "Recently, both collecting paths have been moving from cream toward apricot and rose."
      })
    ],
    collectTogether: task({
      id: "warm-thread",
      title: "Follow the warm thread",
      description: "Together, notice two apricot or cream-rose moments.",
      eligiblePaletteIds: ["apricot", "cream-rose"],
      targetCount: 2,
      initialProgress: 1,
      rewardLabel: "One extra Companion encounter"
    })
  },
  {
    id: "cloud-shelf",
    anonymousName: "Cloud Shelf",
    representativeCompanions: [
      representative({
        id: "cloud-panda",
        modelId: "color-panda",
        paletteId: "sky",
        seed: 4401
      }),
      representative({
        id: "cloud-bunny",
        modelId: "color-bunny",
        paletteId: "candy-mint",
        seed: 4402
      }),
      representative({
        id: "cloud-bird",
        modelId: "color-bird",
        paletteId: "sky",
        seed: 4403
      })
    ],
    sharedSignals: [
      signal({
        id: "cloud-airy-palette",
        kind: "palette",
        sourceModelIds: ["color-panda", "color-bunny", "color-bird"],
        sourcePaletteIds: ["sky", "candy-mint"],
        summary: "Airy blue and mint",
        detail: "You both repeat sky and mint without making either color feel loud."
      }),
      signal({
        id: "cloud-animal-shapes",
        kind: "model",
        sourceModelIds: ["color-bunny", "color-bird"],
        sourcePaletteIds: ["candy-mint", "sky"],
        summary: "Light, rounded silhouettes",
        detail: "Bunny and bird shapes appear often in both collections' quieter corners."
      })
    ],
    collectTogether: task({
      id: "two-cloud-colors",
      title: "Two cloud colors",
      description: "Together, notice two sky or candy-mint moments.",
      eligiblePaletteIds: ["sky", "candy-mint"],
      targetCount: 2,
      initialProgress: 1,
      rewardLabel: "One extra Companion encounter"
    })
  },
  {
    id: "grape-hour",
    anonymousName: "Grape Hour",
    representativeCompanions: [
      representative({
        id: "grape-cat",
        modelId: "color-cat",
        paletteId: "grape",
        seed: 4501
      }),
      representative({
        id: "grape-penguin",
        modelId: "color-penguin",
        paletteId: "berry",
        seed: 4502
      }),
      representative({
        id: "grape-fox",
        modelId: "color-fox",
        paletteId: "grape",
        seed: 4503
      })
    ],
    sharedSignals: [
      signal({
        id: "grape-muted-purple",
        kind: "palette",
        sourceModelIds: ["color-cat", "color-penguin"],
        sourcePaletteIds: ["grape", "berry"],
        summary: "Muted purple notes",
        detail: "Both collections use grape and berry as calm accents rather than statement colors."
      }),
      signal({
        id: "grape-feather-accent",
        kind: "representative",
        sourceModelIds: ["color-fox"],
        sourcePaletteIds: ["grape"],
        summary: "A feathered purple accent",
        detail: "A grape-colored feather gives each collection one restrained focal detail."
      })
    ],
    collectTogether: task({
      id: "purple-pause",
      title: "A purple pause",
      description: "Together, notice two grape or berry Companion moments.",
      eligiblePaletteIds: ["grape", "berry"],
      targetCount: 2,
      initialProgress: 1,
      rewardLabel: "One extra Companion encounter"
    })
  },
  {
    id: "coral-pocket",
    anonymousName: "Coral Pocket",
    representativeCompanions: [
      representative({
        id: "coral-otter",
        modelId: "color-otter",
        paletteId: "coral",
        seed: 4601
      }),
      representative({
        id: "coral-panda",
        modelId: "color-panda",
        paletteId: "apricot",
        seed: 4602
      }),
      representative({
        id: "coral-bunny",
        modelId: "color-bunny",
        paletteId: "cream-rose",
        seed: 4603
      })
    ],
    sharedSignals: [
      signal({
        id: "coral-sunset",
        kind: "trajectory",
        sourceModelIds: ["color-otter", "color-panda", "color-bunny"],
        sourcePaletteIds: ["coral", "apricot", "cream-rose"],
        summary: "A small sunset sequence",
        detail: "Both collecting paths have recently moved through rose, apricot, and coral."
      }),
      signal({
        id: "coral-accessories",
        kind: "representative",
        sourceModelIds: ["color-otter", "color-panda", "color-bunny"],
        sourcePaletteIds: ["coral", "apricot", "cream-rose"],
        summary: "Color held in accessories",
        detail: "You both choose Companions that carry their strongest color in one small detail."
      })
    ],
    collectTogether: task({
      id: "pocket-sunset",
      title: "A pocket sunset",
      description: "Together, notice two coral or apricot Companion moments.",
      eligiblePaletteIds: ["coral", "apricot"],
      targetCount: 2,
      initialProgress: 1,
      rewardLabel: "One extra Companion encounter"
    })
  }
];
