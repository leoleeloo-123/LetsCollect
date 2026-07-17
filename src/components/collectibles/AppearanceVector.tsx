import { getToyMaterial } from "../../features/toys/materialCatalog";
import type {
  AppearanceVector as AppearanceVectorValue,
  Collectible,
  MaterialTraits
} from "../../types/toy";

type AppearanceVectorProps = {
  collectible: Collectible;
  compact?: boolean;
};

const jadeAttributes: Array<{ key: keyof AppearanceVectorValue; label: string }> = [
  { key: "transparency", label: "通透度" },
  { key: "colorDepth", label: "色泽度" },
  { key: "hydration", label: "水润度" },
  { key: "luster", label: "光泽度" },
  { key: "glow", label: "荧光度" }
];

const materialTraitKeys: Array<keyof MaterialTraits> = [
  "craftsmanship",
  "finish",
  "purity",
  "character",
  "brilliance"
];

export function AppearanceVector({ collectible, compact = false }: AppearanceVectorProps) {
  const material = getToyMaterial(collectible.materialId);
  const attributes = collectible.materialId === "jade"
    ? jadeAttributes.map(({ key, label }) => ({ label, score: collectible.appearance[key] }))
    : materialTraitKeys.map((key) => ({
        label: material.traitLabels[key],
        score: collectible.materialTraits[key]
      }));

  return (
    <div className={`appearance-vector${compact ? " appearance-vector--compact" : ""}`}>
      {attributes.map(({ label, score }) => (
        <div className="appearance-vector__row" key={label}>
          <span>{label}</span>
          <span className="appearance-vector__track" aria-hidden="true">
            <span style={{ width: `${score}%` }} />
          </span>
          <strong>{score}</strong>
        </div>
      ))}
    </div>
  );
}
