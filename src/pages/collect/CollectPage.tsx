import {
  LibraryBig,
  Sparkles,
  Ticket,
  Waypoints
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMvpState } from "../../app/MvpState";
import { ColorSeriesCard } from "../../features/collect/ColorSeriesCard";
import {
  colorSpectrumSeries,
  getAvailableCollectSeries,
  specialCollectSeries,
  type AvailableCollectSeriesId
} from "../../features/collect/collectSeries";
import { SpecialSeriesCard } from "../../features/collect/SpecialSeriesCard";
import { DrawReveal } from "../../features/draw/DrawReveal";
import type { Collectible, ToyPaletteId } from "../../types/toy";
import "./collect-page.css";

const DRAW_REVEAL_DELAY_MS = 720;

export function CollectPage() {
  const {
    collection,
    representativeIds,
    tickets,
    drawCollectibleFromSeries
  } = useMvpState();
  const [selectedColorPaletteId, setSelectedColorPaletteId] =
    useState<ToyPaletteId>(
      colorSpectrumSeries.palettePolicy.defaultPaletteId
    );
  const [drawingSeriesId, setDrawingSeriesId] =
    useState<AvailableCollectSeriesId | null>(null);
  const [result, setResult] = useState<Collectible | null>(null);
  const [resultSeriesTitle, setResultSeriesTitle] = useState("");
  const drawTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (drawTimerRef.current !== null) {
      window.clearTimeout(drawTimerRef.current);
    }
  }, []);

  const representativeCount = representativeIds.filter((id) =>
    collection.some((toy) => toy.id === id)
  ).length;

  const handleDraw = (
    seriesId: AvailableCollectSeriesId,
    paletteId?: ToyPaletteId
  ) => {
    if (drawingSeriesId !== null) return;
    const series = getAvailableCollectSeries(seriesId);
    if (!series || tickets < series.ticketCost) return;

    setDrawingSeriesId(series.id);
    setResultSeriesTitle(series.title);

    drawTimerRef.current = window.setTimeout(() => {
      const nextResult = drawCollectibleFromSeries({
        seriesId,
        ...(paletteId ? { paletteId } : {})
      });
      setResult(nextResult);
      setDrawingSeriesId(null);
      drawTimerRef.current = null;
    }, DRAW_REVEAL_DELAY_MS);
  };

  const drawLocked = drawingSeriesId !== null;

  return (
    <div className="collect-page">
      <header className="collect-page__intro">
        <div>
          <p className="collect-kicker">
            <Waypoints size={14} aria-hidden="true" />
            系列盲盒
          </p>
          <h1>今天，想从哪个系列里遇见新伙伴？</h1>
        </div>
        <p>
          先从九种色系中选一个喜欢的颜色，或直接浏览不同主题。
          每张卡片都是独立盲盒，选定后就在这里揭晓。
        </p>
      </header>

      <dl className="collect-page__summary" aria-label="当前收藏状态">
        <div>
          <dt><Ticket size={14} aria-hidden="true" /> 抽取券</dt>
          <dd>{tickets}<small>张</small></dd>
        </div>
        <div>
          <dt><LibraryBig size={14} aria-hidden="true" /> 藏品</dt>
          <dd>{collection.length}<small>只</small></dd>
        </div>
        <div>
          <dt><Sparkles size={14} aria-hidden="true" /> 代表伙伴</dt>
          <dd>{representativeCount}<small>/ 3</small></dd>
        </div>
      </dl>

      <section
        className="collect-page__series-section"
        aria-labelledby="color-series-heading"
      >
        <div className="collect-page__section-heading">
          <div>
            <p className="collect-kicker">COLOR SERIES</p>
            <h2 id="color-series-heading">色彩系列</h2>
          </div>
          <p>一张卡片，九种颜色，十二款伙伴。</p>
        </div>

        <ColorSeriesCard
          series={colorSpectrumSeries}
          paletteId={selectedColorPaletteId}
          tickets={tickets}
          isDrawing={drawingSeriesId === colorSpectrumSeries.id}
          drawLocked={drawLocked}
          onPaletteChange={setSelectedColorPaletteId}
          onDraw={() => handleDraw(
            colorSpectrumSeries.id,
            selectedColorPaletteId
          )}
        />
      </section>

      <section
        className="collect-page__series-section"
        aria-labelledby="special-series-heading"
      >
        <div className="collect-page__section-heading">
          <div>
            <p className="collect-kicker">SPECIAL SERIES</p>
            <h2 id="special-series-heading">特殊系列</h2>
          </div>
          <p>按角色、兴趣和材质组成的小型主题池。</p>
        </div>

        <div className="collect-page__special-grid">
          {specialCollectSeries.map((series) => (
            <SpecialSeriesCard
              key={series.id}
              series={series}
              tickets={tickets}
              isDrawing={drawingSeriesId === series.id}
              drawLocked={drawLocked}
              onDraw={() => handleDraw(series.id)}
            />
          ))}
        </div>
      </section>

      {result ? (
        <DrawReveal
          toy={result}
          encounterLabel={resultSeriesTitle}
          onClose={() => setResult(null)}
        />
      ) : null}
    </div>
  );
}
