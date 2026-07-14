import type { AppearanceVector as AppearanceVectorValue, Collectible } from "../../types/toy";

type AppearanceVectorProps = {
  collectible: Collectible;
  compact?: boolean;
};

const attributes: Array<{ key: keyof AppearanceVectorValue; label: string }> = [
  { key: "transparency", label: "通透度" },
  { key: "colorDepth", label: "色泽度" },
  { key: "hydration", label: "水润度" },
  { key: "luster", label: "光泽度" },
  { key: "glow", label: "荧光度" }
];

export function AppearanceVector({ collectible, compact = false }: AppearanceVectorProps) {
  return (
    <div className={`appearance-vector${compact ? " appearance-vector--compact" : ""}`}>
      {attributes.map(({ key, label }) => {
        const score = collectible.appearance[key];
        return (
          <div className="appearance-vector__row" key={key}>
            <span>{label}</span>
            <span className="appearance-vector__track" aria-hidden="true">
              <span style={{ width: `${score}%` }} />
            </span>
            <strong>{score}</strong>
          </div>
        );
      })}
    </div>
  );
}
