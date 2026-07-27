import type { ReactNode } from "react";
import type { ToyPaletteDefinition, ToyPaletteId } from "../../types/toy";

type AssetLabAccessoryCardProps = {
  assetId: string;
  kind: string;
  name: string;
  recolorTarget: string;
  paletteId: ToyPaletteId;
  palettes: ToyPaletteDefinition[];
  onPaletteChange: (paletteId: ToyPaletteId) => void;
  children: ReactNode;
};

export function AssetLabAccessoryCard({
  assetId,
  kind,
  name,
  recolorTarget,
  paletteId,
  palettes,
  onPaletteChange,
  children
}: AssetLabAccessoryCardProps) {
  const activePalette = palettes.find((palette) => palette.id === paletteId) ?? palettes[0];

  return (
    <article className="asset-lab-card" data-asset-id={assetId}>
      <div className="asset-lab-card__viewer">{children}</div>

      <div className="asset-lab-card__meta">
        <div>
          <span className="asset-lab-card__kind">{kind}</span>
          <h2>{name}</h2>
          <p>换色目标：{recolorTarget}</p>
        </div>
        <span
          className="asset-lab-card__swatch"
          style={{ backgroundColor: activePalette.color }}
          aria-label={`当前颜色 ${activePalette.name}`}
        />
      </div>

      <label
        className="asset-lab-card__select"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <span>检查配色</span>
        <select
          value={paletteId}
          onChange={(event) => onPaletteChange(event.target.value as ToyPaletteId)}
          aria-label={`选择${name}配色`}
        >
          {palettes.map((palette) => (
            <option key={palette.id} value={palette.id}>
              {palette.name}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
}