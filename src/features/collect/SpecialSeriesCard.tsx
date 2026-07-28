import { Ticket } from "lucide-react";
import type { AvailableCollectSeries } from "./collectSeries";
import { SeriesModelGrid } from "./SeriesModelGrid";

type SpecialSeriesCardProps = {
  series: AvailableCollectSeries;
  tickets: number;
  isDrawing: boolean;
  drawLocked: boolean;
  onDraw: () => void;
};

export function SpecialSeriesCard({
  series,
  tickets,
  isDrawing,
  drawLocked,
  onDraw
}: SpecialSeriesCardProps) {
  const canDraw = tickets >= series.ticketCost && !drawLocked;

  return (
    <article
      className={`series-card special-series-card${isDrawing ? " is-drawing" : ""}`}
      aria-labelledby={`${series.id}-title`}
    >
      <div className="series-card__visual special-series-card__visual">
        <SeriesModelGrid series={series} variant="special" />
        {isDrawing ? (
          <div className="series-card__drawing" role="status">
            正在打开「{series.title}」盲盒…
          </div>
        ) : null}
      </div>

      <div className="series-card__content">
        <div className="series-card__heading">
          <p className="collect-kicker">{series.eyebrow}</p>
          <h3 id={`${series.id}-title`}>{series.title}</h3>
          <p>{series.description}</p>
        </div>

        <div className="series-card__action">
          <p>
            <strong>{series.memberSummary}</strong>
            <span>
              {series.palettePolicy.paletteIds.length} 种颜色随机出现
            </span>
          </p>
          <button type="button" onClick={onDraw} disabled={!canDraw}>
            <Ticket size={17} aria-hidden="true" />
            {tickets < series.ticketCost
              ? "抽取券不足"
              : isDrawing
                ? "正在抽取"
                : `抽取 · ${series.ticketCost} 张券`}
          </button>
        </div>
      </div>
    </article>
  );
}
