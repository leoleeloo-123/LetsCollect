import type { Collectible, MaterialTraits } from "../../types/toy";

type StoredCollectible = Omit<
  Collectible,
  "materialId" | "materialGrade" | "materialTraits"
> & Partial<Pick<Collectible, "materialId" | "materialGrade" | "materialTraits">>;

function deriveLegacyTraits(toy: StoredCollectible): MaterialTraits {
  return {
    craftsmanship: toy.qualityScore,
    finish: toy.appearance.luster,
    purity: toy.appearance.transparency,
    character: toy.appearance.colorDepth,
    brilliance: toy.appearance.glow
  };
}

/** Adds the V2 material boundary without changing a V1 collectible identity. */
export function normalizeStoredCollectible(toy: StoredCollectible): Collectible {
  const materialId = toy.materialId ?? "jade";
  return {
    ...toy,
    materialId,
    materialGrade: toy.materialGrade ?? toy.jadeGrade ?? "果冻玉",
    materialTraits: toy.materialTraits ?? deriveLegacyTraits(toy)
  };
}

export function getCollectibleGradeLabel(toy: Collectible) {
  return toy.materialId === "jade"
    ? toy.jadeGrade ?? toy.materialGrade
    : toy.materialGrade;
}
