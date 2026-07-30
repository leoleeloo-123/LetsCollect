export type RegistryId = string;

export type RegistryRecord = {
  id: RegistryId;
  enabled?: boolean;
};

export type ToyFallbackShapeRecord =
  | "unicorn"
  | "cat"
  | "bunny"
  | "bird"
  | "dog"
  | "blob";

export type ToyModelCalibrationRecord = {
  scaleMultiplier: number;
  yOffset: number;
  rotationYDeg: number;
};

export type ToyPresentationContext =
  | "detail"
  | "collection"
  | "series"
  | "thumbnail";

export type ToyPresentationOverrideRecord = {
  framingScale?: number;
  targetYOffset?: number;
  yawOffsetDeg?: number;
  padding?: number;
};

export type ToyModelRecord = RegistryRecord & {
  name: string;
  description?: string;
  species?: string;
  fallbackShape: ToyFallbackShapeRecord;
  assets: {
    modelUrl: string;
    mobileModelUrl?: string;
  };
  calibration: ToyModelCalibrationRecord;
  recolorProfileId: RegistryId | null;
  presentation?: Partial<
    Record<ToyPresentationContext, ToyPresentationOverrideRecord>
  >;
  sortOrder: number;
};

export type PaletteRecord = RegistryRecord & {
  name: string;
  color: string;
  attenuation: string;
  emissive: string;
  glow: string;
  sortOrder: number;
};

export type SurfaceRenderProfile =
  | "detail"
  | "compact"
  | "tile"
  | "thumbnail";

export type SurfaceRenderValuesRecord = {
  metalness: number;
  roughness: number;
  envMapIntensity: number;
};

export type SurfaceRecord = RegistryRecord & {
  kind: "matte" | "metal";
  name: string;
  shortName: string;
  description: string;
  colorOverride: string | null;
  glowOverride: string | null;
  swatch: string;
  render: Record<SurfaceRenderProfile, SurfaceRenderValuesRecord>;
  sortOrder: number;
};

export type ParticlePresetId = "snow" | "leaf";

export type BackgroundRecord = RegistryRecord & {
  name: string;
  group: "dynamic" | "static";
  background: string;
  swatch: string;
  particlePresetId: ParticlePresetId | null;
  groundId?: RegistryId | null;
  sortOrder: number;
};

export type RendererProfileId =
  | "color-bunny-bag"
  | "color-cat-yarn"
  | "color-panda-hat"
  | "color-otter-lollipop"
  | "color-bear-singer-afro"
  | "color-dog-camera-accessories"
  | "color-dog-drum"
  | "color-seal-starfish"
  | "color-karpy-hat"
  | "color-koala-hat"
  | "color-accessory-mask";

export type AccessoryMaskProfileId =
  | "bird-crown"
  | "penguin-accessories"
  | "racoon-tanghulu"
  | "hamster-icecream"
  | "dino-scarf"
  | "fox-hat"
  | "deer-accessories"
  | "sheep-accessories"
  | "sloth-hat"
  | "owl-academic"
  | "duck-bath"
  | "guinea-pig-balloons"
  | "black-cat-logo"
  | "cool-wolf-studs";

export type RecolorMaskType =
  | "material-name"
  | "protect-mask"
  | "texture-mask"
  | "texture-and-triangle-mask"
  | "texture-and-object-mask"
  | "material-parameters";

export type RecolorProfileRecord = RegistryRecord & {
  rendererProfileId: RendererProfileId;
  accessoryProfileId?: AccessoryMaskProfileId;
  maskType: RecolorMaskType;
  materialName?: string;
  maskUrl?: string;
  protectMaskUrl?: string;
  triangleMaskUrl?: string;
  secondaryMaskUrl?: string;
  objectMaskUrl?: string;
  colorScale?: number;
  supportsSurfaceOverride: boolean;
};

export type SelectedPalettePolicyRecord = {
  mode: "selected";
  paletteIds: readonly RegistryId[];
  defaultPaletteId: RegistryId;
};

export type RandomPalettePolicyRecord = {
  mode: "random";
  paletteIds: readonly RegistryId[];
};

export type SeriesPalettePolicyRecord =
  | SelectedPalettePolicyRecord
  | RandomPalettePolicyRecord;

export type SeriesSurfacePolicyRecord =
  | { mode: "default" }
  | { mode: "fixed"; surfaceStyleId: RegistryId };

export type SeriesRecord = RegistryRecord & {
  category: "color" | "special";
  eyebrow: string;
  title: string;
  description: string;
  memberSummary: string;
  ticketCost: number;
  palettePolicy: SeriesPalettePolicyRecord;
  surfacePolicy?: SeriesSurfacePolicyRecord;
  sortOrder: number;
};

export type SeriesMemberRecord = RegistryRecord & {
  seriesId: RegistryId;
  modelId: RegistryId;
  displayOrder: number;
  drawWeight: number;
  palettePolicyOverride?: SeriesPalettePolicyRecord | null;
  surfacePolicyOverride?: SeriesSurfacePolicyRecord | null;
};

export type AssetRegistrySnapshot = {
  toyModels: readonly ToyModelRecord[];
  palettes: readonly PaletteRecord[];
  surfaces: readonly SurfaceRecord[];
  backgrounds: readonly BackgroundRecord[];
  recolorProfiles: readonly RecolorProfileRecord[];
  series: readonly SeriesRecord[];
  seriesMembers: readonly SeriesMemberRecord[];
};

export type ResolvedToyPresentation = {
  context: ToyPresentationContext;
  scaleMultiplier: number;
  yOffset: number;
  rotationYRad: number;
  framingScale: number;
  targetYOffset: number;
  yawOffsetRad: number;
  padding: number;
};
