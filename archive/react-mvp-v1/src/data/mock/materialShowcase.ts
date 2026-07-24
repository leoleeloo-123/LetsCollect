import { toyModels } from "../../features/toys/catalog";
import { generateCollectible } from "../../features/toys/legacyGenerator";
import { drawableMaterials } from "../../features/toys/materialCatalog";
import type { ToyMaterialId } from "../../types/toy";

const SHOWCASE_CREATED_AT = "2026-07-17T00:00:00.000Z";

export const materialShowcaseToys = toyModels.flatMap((model, modelIndex) =>
  drawableMaterials.map((material, materialIndex) =>
    generateCollectible({
      id: `showcase_${model.id}_${material.id}`,
      publicCode: `LC-S${String(modelIndex + 1).padStart(2, "0")}${String(materialIndex + 1).padStart(2, "0")}`,
      seed: 10_000 + modelIndex * 1_000 + materialIndex * 97,
      modelId: model.id,
      paletteId: "rose",
      materialId: material.id as Exclude<ToyMaterialId, "jade">,
      createdAt: SHOWCASE_CREATED_AT
    })
  )
);
