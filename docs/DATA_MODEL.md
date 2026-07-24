# Data Model

This document distinguishes implemented data from approved target contracts. Only the items under **Current Implemented Data** exist today. Target contracts may initially use local/mock adapters and must not be represented as cloud-backed or production-ready.

## Modeling Principles

- A Companion model is a reusable base asset. Colorways are properties of a collectible instance, not duplicate GLB records.
- Files and archived experiments do not determine availability. The capability registry does.
- Collection Signature, atlas completion, and affinity summaries are derived from real owned items and events.
- Echo is anonymous and collection-led. Its contracts omit demographics, presence, chat, followers, and match percentages.
- Agent outputs are typed, explainable, feasibility-checked, and human-approved where they change configuration.
- Demo fixtures must use real active model and palette IDs.

## Current Implemented Data

### Supabase Profile

Implemented in `public.profiles`:

```ts
type Profile = {
  id: string;
  display_name: string;
  public_code: string;
  avatar_key: string;
  created_at: string;
  updated_at: string;
};
```

`id` references `auth.users.id`. The application currently creates anonymous Auth users and inserts the profile through `complete_onboarding`.

### Local MVP Snapshot

Implemented in `MvpStateProvider` and persisted to browser `localStorage`:

```ts
type MvpSnapshot = {
  tickets: number;
  interactedActivityIds: string[];
  collection: Collectible[];
  friendIds: string[];
  pendingFriendIds: string[];
  recentDraws: DrawRecord[];
};
```

This snapshot is not keyed by Supabase user ID and is not an authoritative ledger.

### Collectible

Implemented in `src/types/toy.ts`:

```ts
type Collectible = {
  id: string;
  publicCode: string;
  modelId: ToyModelId;
  paletteId: ToyPaletteId;
  name: string;
  seriesId: string;
  seriesName: string;
  rarity: RarityCode;
  qualityScore: number;
  materialId: ToyMaterialId;
  materialGrade: string;
  materialTraits: MaterialTraits;
  appearanceSeed: number;
  generationVersion: number;
  appearance: AppearanceVector;
  appearanceSignature: string;
  shortDescription: string;
  createdAt: string;
};
```

The active V3 inventory uses ten matte Color Animals, two crystal models
(`diamond-unicorn` and `diamond-dog`), nine regular palette IDs, and five native
crystal palette IDs. The Collect Color series pairs every one of the twelve
models with the selected regular palette and draws uniformly from that model
pool. Each special series owns an explicit model pool, palette policy, and
ticket cost; it does not inherit the global hidden-special branch. The
compatible global draw remains 95% matte / 5% crystal and selects uniformly
within the chosen material branch. Older Jelly Jade models and material
definitions remain for compatibility and rollback; they are not active V3
inventory.

### Draw Record

Implemented locally:

```ts
type DrawRecord = {
  id: string;
  collectibleId: string;
  createdAt: string;
  encounterSeriesId?: string;
};
```

Series draws record the selected series ID for local presentation and deduct
that series' configured ticket cost. The current client generator immediately
inserts its result into the local collection. It is not a trusted server draw,
ticket transaction, or separate collect / skip decision.

### Mock Social Data And Thumbnail Cache

Friend profiles, community events, reactions, comments, and collector profiles are Demo fixtures. Friend IDs persist locally; several reactions and comments remain in memory only. Rendered WebP thumbnails persist in IndexedDB as a render optimization, not ownership authority.

## Approved Target Contracts

The following contracts are planned and are not implemented yet.

### Capability And Companion Model

```ts
type Availability =
  | "available"
  | "legacy"
  | "experimental"
  | "planned"
  | "unavailable";

type CompanionModel = {
  id: string;
  name: string;
  modelUrl: string;
  mobileModelUrl: string;
  materialType: "matte_resin" | "crystal";
  availableColorIds: string[];
  defaultColorId: string;
  availability: Availability;
  renderingMode: string;
  descriptiveTags: string[];
  sourceMetadata?: Record<string, string>;
};
```

An archived source file, model Lab, or future idea cannot be `available` unless the production viewer, draw rules, and C-end presentation support it.

### Collectible Instance And Ownership

```ts
type CollectibleInstance = {
  id: string;
  modelId: string;
  selectedColorId: string;
  materialType: "matte_resin" | "crystal";
  appearanceSeed: number;
  appearanceSignature: string;
  generatedAt: string;
};

type UserCollectionItem = {
  id: string;
  ownerId: string;
  collectibleInstanceId: string;
  acquiredAt: string;
  isFavorite: boolean;
  representativeRank: 1 | 2 | 3 | null;
  sourceCampaignId?: string;
  drawMetadata?: {
    drawId: string;
    poolVersion: string;
  };
};
```

At most three owned items may have a Representative rank. The repository / service and future backend must enforce that invariant.

For local migration, the current `Collectible` can remain the render payload while favorite and Representative IDs live in a versioned snapshot. A cloud schema may normalize model, instance, and ownership records.

### User Taste Profile And Signature

```ts
type UserTasteProfile = {
  userId: string;
  explicitlyPreferredModelIds: string[];
  preferredColorIds: string[];
  materialAffinity: Partial<Record<"matte_resin" | "crystal", number>>;
  representativeCollectionItemIds: string[];
  inferredColorDistribution: Record<string, number>;
  inferredModelAffinity: Record<string, number>;
  recentSignals: TasteSignal[];
  updatedAt: string;
};

type CollectionSignature = {
  representativeCollectionItemIds: string[];
  leadingModelIds: string[];
  leadingColorIds: string[];
  materialAffinity: Partial<Record<"matte_resin" | "crystal", number>>;
  summaryKeys: string[];
  generatedAt: string;
};
```

Inferred fields are recomputable from real events and ownership. `summaryKeys` reference centrally managed copy and must not infer sensitive personal attributes.

### Typed Product Event

```ts
type ProductEventName =
  | "draw_started"
  | "companion_drawn"
  | "companion_collected"
  | "companion_skipped"
  | "companion_favorited"
  | "representative_set"
  | "color_preference_selected"
  | "material_preference_selected"
  | "echo_viewed"
  | "echo_left"
  | "echo_drifted"
  | "echo_mutual"
  | "shared_task_started"
  | "shared_task_progressed"
  | "shared_task_completed"
  | "campaign_exposed"
  | "campaign_joined"
  | "campaign_completed";

type ProductEvent = {
  id: string;
  name: ProductEventName;
  anonymousActorId: string;
  occurredAt: string;
  schemaVersion: number;
  properties: Record<string, string | number | boolean | null>;
};
```

Properties may contain registered model, palette, material, campaign, or task IDs. They must not contain photos, chat content, exact location, sensitive identity data, or protected-attribute inference.

### Resonance Result And Echo

```ts
type ResonanceResult = {
  candidateId: string;
  anonymousName: string;
  representativeCompanions: Array<{
    collectionItemId: string;
    modelId: string;
    colorId: string;
  }>;
  sharedSignals: Array<{
    signalType: "model" | "color" | "material" | "representative" | "trajectory";
    sourceIds: string[];
    explanationKey: string;
  }>;
  primaryReason: string;
  secondaryReason?: string;
  internalScore: number;
  confidence: number;
  generatedAt: string;
};

type EchoCandidate = {
  id: string;
  anonymousCollectorId: string;
  anonymousName: string;
  resonance: ResonanceResult;
  status: "unseen" | "viewed" | "left" | "drifted" | "mutual" | "expired";
  createdAt: string;
  expiresAt?: string;
};
```

`internalScore` and `confidence` are diagnostics and never appear as match percentages. Reasons must trace back to `sharedSignals`.

### Shared Collection Task

```ts
type SharedCollectionTask = {
  id: string;
  participantIds: string[];
  taskType: "collect_color" | "collect_models" | "favorite_companions";
  target: Record<string, string | number>;
  progressByParticipant: Record<string, number>;
  combinedProgress: number;
  reward: {
    type: "badge" | "extra_draw" | "existing_color_unlock";
    value: string | number;
  };
  status: "active" | "completed" | "expired";
  expiresAt: string;
};
```

This is a small shared progress card, not a free-text interaction channel.

### Campaign Proposal

```ts
type CampaignFeasibility =
  | "available_now"
  | "requires_configuration"
  | "requires_asset_creation"
  | "requires_engineering";

type CampaignProposal = {
  id: string;
  title: string;
  sourceInsight: string;
  targetSegment: string;
  requiredCapabilityIds: string[];
  currentAssetIds: string[];
  colorWeights: Record<string, number>;
  materialWeights: Record<string, number>;
  drawWeights: Record<string, number>;
  sharedTask?: SharedCollectionTask;
  reward: SharedCollectionTask["reward"];
  duration: { startsAt: string; endsAt: string };
  feasibility: CampaignFeasibility;
  blockingReasons: string[];
  status:
    | "draft"
    | "awaiting_approval"
    | "approved"
    | "rejected"
    | "active"
    | "measuring"
    | "archived";
  evaluationMetrics: string[];
};
```

Only `available_now`, or explicitly reviewed `requires_configuration`, proposals may be approved. Asset-creation and engineering proposals remain roadmap briefs.

## Target Repository And Service Interfaces

```ts
interface CollectionRepository {
  listOwned(): Promise<UserCollectionItem[]>;
  collect(item: UserCollectionItem): Promise<void>;
  setFavorite(id: string, favorite: boolean): Promise<void>;
  setRepresentatives(idsInOrder: string[]): Promise<void>;
}

interface AnalyticsAdapter {
  track(event: ProductEvent): Promise<void>;
}

interface ResonanceService {
  findEcho(profile: UserTasteProfile): Promise<ResonanceResult | null>;
}

interface CampaignService {
  propose(): Promise<CampaignProposal[]>;
  approve(id: string): Promise<CampaignProposal>;
}
```

Local adapters may satisfy these interfaces during the Demo. Future Supabase or API adapters must preserve the domain contract so pages do not require a rewrite.

## Future Supabase And Server Requirements

- ownership tables must be user-scoped with RLS;
- Echo responses expose only the minimum anonymous projection required by the UI;
- aggregate Agent inputs must not reveal individual sensitive records;
- Representative limits and task rewards need trusted enforcement;
- draw result generation, ticket deduction, and collection insertion must be atomic and idempotent;
- campaign approval and application must be server-authorized and auditable;
- admin authorization must use trusted claims or server roles, never user-editable metadata.
