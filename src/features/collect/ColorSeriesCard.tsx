import { Ticket } from "lucide-react";
import type { CSSProperties } from "react";
import { getToyPalette } from "../toys/catalog";
import type { ToyPaletteId } from "../../types/toy";
import type { AvailableCollectSeries } from "./collectSeries";
import { SeriesModelGrid } from "./SeriesModelGrid";

type ColorSeriesCardProps = {
  series: AvailableCollectSeries;
  paletteId: ToyPaletteId;
  tickets: number;
  isDrawing: boolean;
  drawLocked: boolean;
  onPaletteChange: (paletteId: ToyPaletteId) => void;
  onDraw: () => void;
};

export function ColorSeriesCard({
  series,
  paletteId,
  tickets,
  isDrawing,
  drawLocked,
  onPaletteChange,
  onDraw
}: ColorSeriesCardProps) {
  const canDraw = tickets >= series.ticketCost && !drawLocked;
  const paletteOptions = series.palettePolicy.paletteIds.map(getToyPalette);
  const selectedPalette = paletteOptions.find(
    (palette) => palette.id === paletteId
  ) ?? paletteOptions[0];

  return (
    <article
      className={`series-card color-series-card${isDrawing ? " is-drawing" : ""}`}
      aria-labelledby={`${series.id}-title`}
    >
      <div className="series-card__visual color-series-card__visual">
        <SeriesModelGrid
          series={series}
          paletteId={paletteId}
          variant="color"
        />
        {isDrawing ? (
          <div className="series-card__drawing" role="status">
            正在打开「{selectedPalette.name}」盲盒…
          </div>
        ) : null}
      </div>

      <div className="series-card__content">
        <div className="series-card__heading">
          <p className="collect-kicker">{series.eyebrow}</p>
          <h3 id={`${series.id}-title`}>{series.title}</h3>
          <p>{series.description}</p>
        </div>

        <fieldset className="color-series-card__palette" disabled={drawLocked}>
          <legend>选择代表色</legend>
          <div className="color-series-card__palette-options">
            {paletteOptions.map((palette) => (
              <label
                className="color-series-card__palette-option"
                key={palette.id}
                title={palette.name}
              >
                <input
                  type="radio"
                  name={`${series.id}-palette`}
                  value={palette.id}
                  checked={palette.id === paletteId}
                  onChange={() => onPaletteChange(palette.id)}
                  aria-label={palette.name}
                />
                <span
                  style={{
                    "--series-palette-color": palette.color
                  } as CSSProperties}
                  aria-hidden="true"
                />
              </label>
            ))}
          </div>
          <p aria-live="polite">
            当前色系 <strong>{selectedPalette.name}</strong>
          </p>
        </fieldset>

        <div className="series-card__action">
          <p>
            <strong>{series.memberSummary}</strong>
            <span>已选颜色会应用到本次结果</span>
          </p>
          <button type="button" onClick={onDraw} disabled={!canDraw}>
            <Ticket size={17} aria-hidden="true" />
            {tickets < series.ticketCost
              ? "抽取券不足"
              : isDrawing
                ? "正在抽取"
                : `抽取 1 只 · ${series.ticketCost} 张券`}
          </button>
        </div>
      </div>
    </article>
  );
}
