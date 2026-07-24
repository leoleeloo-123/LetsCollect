import { useEffect, useMemo, useState } from "react";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import type { ToyPaletteId } from "../../types/toy";
import {
  getCollectSeriesPreviewToys,
  type AvailableCollectSeries
} from "./collectSeries";

type SeriesModelGridProps = {
  series: AvailableCollectSeries;
  paletteId?: ToyPaletteId;
  variant: "color" | "special";
};

export function SeriesModelGrid({
  series,
  paletteId,
  variant
}: SeriesModelGridProps) {
  const [previewPaletteId, setPreviewPaletteId] = useState(paletteId);

  useEffect(() => {
    if (paletteId === previewPaletteId) return;

    const previewDelay = window.setTimeout(() => {
      setPreviewPaletteId(paletteId);
    }, 180);

    return () => window.clearTimeout(previewDelay);
  }, [paletteId, previewPaletteId]);

  const previewToys = useMemo(
    () => getCollectSeriesPreviewToys(series, previewPaletteId),
    [previewPaletteId, series]
  );

  return (
    <div
      className={`series-model-grid series-model-grid--${variant}`}
      data-count={previewToys.length}
      role="list"
      aria-label={`${series.title}系列的 ${previewToys.length} 款伙伴`}
    >
      {previewToys.map((toy) => (
        <div className="series-model-grid__item" role="listitem" key={toy.id}>
          <ToyThumbnail
            toy={toy}
            size="card"
            className="series-model-grid__thumbnail"
          />
        </div>
      ))}
    </div>
  );
}
