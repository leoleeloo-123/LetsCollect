import {
  ChevronLeft,
  ChevronRight,
  LibraryBig,
  LockKeyhole,
  Sparkles,
  Ticket
} from "lucide-react";
import { DRAW_COST } from "../../app/MvpState";
import { ToyViewer } from "../../three/ToyViewer";
import { getToyModel } from "../toys/catalog";
import {
  getCollectSeriesPreviewToys,
  specialExhibitProbability,
  type CollectSeriesDefinition
} from "./collectSeries";
import { useSharedToyRotation } from "../home/useSharedToyRotation";

type CollectSeriesStageProps = {
  series: CollectSeriesDefinition;
  seriesIndex: number;
  seriesCount: number;
  tickets: number;
  isDrawing: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onDraw: () => void;
};

export function CollectSeriesStage({
  series,
  seriesIndex,
  seriesCount,
  tickets,
  isDrawing,
  onPrevious,
  onNext,
  onDraw
}: CollectSeriesStageProps) {
  const {
    controller,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown
  } = useSharedToyRotation();
  const previewToys = getCollectSeriesPreviewToys(series);
  const canDraw =
    series.availability === "available"
    && tickets >= DRAW_COST
    && !isDrawing;

  return (
    <section
      className={`collection-stage collection-stage--compact collect-series-stage collect-series-stage--${series.availability}`}
      aria-labelledby="collect-series-title"
    >
      <div className="collect-series-stage__switcher">
        <button type="button" onClick={onPrevious} aria-label="查看上一个系列">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span aria-live="polite">
          {seriesIndex + 1} / {seriesCount}
        </span>
        <button type="button" onClick={onNext} aria-label="查看下一个系列">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div
        className="collection-stage__viewport"
        role="group"
        tabIndex={series.availability === "available" ? 0 : -1}
        aria-label={
          series.availability === "available"
            ? `${series.title}，${previewToys.length} 款可同步旋转的 3D 玩偶。左右拖动或使用方向键查看。`
            : `${series.title}，筹备中。${series.lockedReason}`
        }
        onPointerDown={
          series.availability === "available" ? handlePointerDown : undefined
        }
        onPointerMove={
          series.availability === "available" ? handlePointerMove : undefined
        }
        onPointerUp={
          series.availability === "available" ? handlePointerUp : undefined
        }
        onPointerCancel={
          series.availability === "available" ? handlePointerCancel : undefined
        }
        onKeyDown={
          series.availability === "available" ? handleKeyDown : undefined
        }
      >
        <div className="collection-stage__meta">
          <span>
            {series.availability === "available"
              ? <LibraryBig size={14} aria-hidden="true" />
              : <LockKeyhole size={14} aria-hidden="true" />}
            {series.eyebrow}
          </span>
          <strong>{series.memberSummary}</strong>
        </div>

        {series.availability === "available" ? (
          <div
            className={`collection-stage__model-grid collect-series-stage__model-grid collect-series-stage__model-grid--${previewToys.length}`}
          >
            {previewToys.map((toy) => (
              <article className="collection-stage__model-tile" key={toy.id}>
                <ToyViewer
                  toy={toy}
                  variant="tile"
                  interactive={false}
                  autoRotate="off"
                  rotationController={controller}
                />
                <span>{getToyModel(toy.modelId).name}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="collect-series-stage__planned">
            <span aria-hidden="true"><LockKeyhole size={24} /></span>
            <strong>这个系列还在睡</strong>
            <p>{series.lockedReason}</p>
          </div>
        )}

        {isDrawing ? (
          <div className="collect-series-stage__drawing" role="status">
            <span aria-hidden="true"><Sparkles size={24} /></span>
            <strong>正在打开「{series.title}」</strong>
            <small>看看这次是哪一只伙伴</small>
          </div>
        ) : null}
      </div>

      <div className="collection-stage__copy collect-series-stage__copy">
        <div>
          <p className="eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            选择系列，再打开盲盒
          </p>
          <h2 id="collect-series-title">{series.title}</h2>
          <p>{series.description}</p>
        </div>

        <div className="collect-series-stage__action">
          {series.availability === "available" ? (
            <>
              <p>
                常规结果 {series.modelIds.length} 中 1
                <span>
                  另有 {Math.round(specialExhibitProbability * 100)}% 钻石独角兽彩蛋
                </span>
              </p>
              <button type="button" onClick={onDraw} disabled={!canDraw}>
                <Ticket size={17} aria-hidden="true" />
                {tickets < DRAW_COST
                  ? "抽取券不足"
                  : isDrawing
                    ? "正在抽取"
                    : `抽取 1 只 · ${DRAW_COST} 张券`}
              </button>
            </>
          ) : (
            <p className="collect-series-stage__locked-copy">
              <LockKeyhole size={15} aria-hidden="true" />
              只记录方向，不开放抽取
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
