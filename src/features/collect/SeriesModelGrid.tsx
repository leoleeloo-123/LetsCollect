import { useEffect, useMemo, useState } from "react";
import { SeriesToyViewer } from "../../three/SeriesToyViewer";
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
    <SeriesToyViewer
      toys={previewToys}
      variant={variant}
      label={`${series.title}系列的 ${previewToys.length} 款伙伴`}
      className={`series-model-grid series-model-grid--${variant}`}
    />
  );
}
