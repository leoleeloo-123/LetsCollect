import type { Collectible, MaterialTraits } from "../../types/toy";
import { colorAnimalsSeries, getColorAnimalGrade } from "./activeSeries";
import { getToyModel, getToyPalette } from "./catalog";

type StoredCollectible = Omit<
  Collectible,
  "materialId" | "materialGrade" | "materialTraits"
> & Partial<Pick<Collectible, "materialId" | "materialGrade" | "materialTraits">>;

function deriveStoredTraits(toy: StoredCollectible): MaterialTraits {
  return {
    craftsmanship: toy.qualityScore,
    finish: toy.appearance.luster,
    purity: toy.appearance.transparency,
    character: toy.appearance.colorDepth,
    brilliance: toy.appearance.glow
  };
}

/** Normalizes a stored active collectible; retired model families are filtered elsewhere. */
export function normalizeStoredCollectible(toy: StoredCollectible): Collectible {
  const isCurrentModel = colorAnimalsSeries.modelIds.includes(toy.modelId);
  const name = isCurrentModel
    ? getToyPalette(toy.paletteId).name + getToyModel(toy.modelId).name
    : toy.name;
  return {
    ...toy,
    name,
    materialId: "plastic",
    materialGrade: toy.materialGrade ?? getColorAnimalGrade(toy.rarity),
    materialTraits: toy.materialTraits ?? deriveStoredTraits(toy)
  };
}

export function getCollectibleGradeLabel(toy: Collectible) {
  return toy.materialGrade;
}
