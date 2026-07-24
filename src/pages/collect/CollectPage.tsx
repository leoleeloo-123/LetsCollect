import {
  LibraryBig,
  Sparkles,
  Ticket,
  Waypoints
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMvpState } from "../../app/MvpState";
import { routes } from "../../app/routes";
import { DrawReveal } from "../../features/draw/DrawReveal";
import { CollectSeriesStage } from "../../features/collect/CollectSeriesStage";
import { collectSeries } from "../../features/collect/collectSeries";
import type { Collectible } from "../../types/toy";
import "./collect-page.css";

const DRAW_REVEAL_DELAY_MS = 720;

export function CollectPage() {
  const {
    collection,
    representativeIds,
    tickets,
    drawCollectibleFromSeries
  } = useMvpState();
  const [seriesIndex, setSeriesIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<Collectible | null>(null);
  const [resultSeriesTitle, setResultSeriesTitle] = useState("");
  const drawTimerRef = useRef<number | null>(null);
  const currentSeries = collectSeries[seriesIndex];

  useEffect(() => () => {
    if (drawTimerRef.current !== null) {
      window.clearTimeout(drawTimerRef.current);
    }
  }, []);

  const representativeCount = representativeIds.filter((id) =>
    collection.some((toy) => toy.id === id)
  ).length;

  const changeSeries = (direction: -1 | 1) => {
    if (isDrawing) return;
    setSeriesIndex((current) =>
      (current + direction + collectSeries.length) % collectSeries.length
    );
  };

  const handleDraw = () => {
    if (isDrawing || currentSeries.availability !== "available") return;

    setIsDrawing(true);
    setResultSeriesTitle(currentSeries.title);
    const seriesId = currentSeries.id;

    drawTimerRef.current = window.setTimeout(() => {
      const nextResult = drawCollectibleFromSeries(seriesId);
      setResult(nextResult);
      setIsDrawing(false);
      drawTimerRef.current = null;
    }, DRAW_REVEAL_DELAY_MS);
  };

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
          左右切换不同系列，看看里面现在有哪些真实伙伴。
          选定后直接在这一页抽取，不需要再跳去另一个页面。
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

      <CollectSeriesStage
        key={currentSeries.id}
        series={currentSeries}
        seriesIndex={seriesIndex}
        seriesCount={collectSeries.length}
        tickets={tickets}
        isDrawing={isDrawing}
        onPrevious={() => changeSeries(-1)}
        onNext={() => changeSeries(1)}
        onDraw={handleDraw}
      />

      <section className="collect-page__guide" aria-labelledby="collect-guide-title">
        <div>
          <p className="collect-kicker">怎么抽</p>
          <h2 id="collect-guide-title">选系列，不用猜概率</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div><strong>挑一个系列</strong><p>每个系列只展示当前真实存在的成员。</p></div>
          </li>
          <li>
            <span>02</span>
            <div><strong>原地打开盲盒</strong><p>扣除 3 张券，常规成员在主题池内均等出现。</p></div>
          </li>
          <li>
            <span>03</span>
            <div><strong>直接进入藏品柜</strong><p>揭晓结果会立即保存，也可以设为最爱。</p></div>
          </li>
        </ol>
        <Link to={routes.collection}>
          <LibraryBig size={17} aria-hidden="true" />
          查看我的藏品柜
        </Link>
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
