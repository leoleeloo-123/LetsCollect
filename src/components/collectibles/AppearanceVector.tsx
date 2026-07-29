import { getCollectibleTraitLabels } from "../../features/toys/presentation";
import type {
  Collectible,
  MaterialTraits
} from "../../types/toy";

type AppearanceVectorProps = {
  collectible: Collectible;
  compact?: boolean;
};

const materialTraitKeys: Array<keyof MaterialTraits> = [
  "craftsmanship",
  "finish",
  "purity",
  "character",
  "brilliance"
];

export function AppearanceVector({ collectible, compact = false }: AppearanceVectorProps) {
  const traitLabels = getCollectibleTraitLabels(collectible);
  const attributes = materialTraitKeys.map((key) => ({
    label: traitLabels[key],
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
