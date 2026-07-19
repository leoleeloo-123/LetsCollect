import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LibraryBig,
  Sparkles
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import { routes } from "../../app/routes";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { homeSeriesToys } from "../../data/mock/homeSeries";
import { colorAnimalsSeries } from "../toys/activeSeries";
import { ToyViewer } from "../../three/ToyViewer";

const AUTO_ADVANCE_MS = 5200;

function getStagePosition(index: number, activeIndex: number) {
  let offset = index - activeIndex;
  if (offset > homeSeriesToys.length / 2) offset -= homeSeriesToys.length;
  if (offset < -homeSeriesToys.length / 2) offset += homeSeriesToys.length;
  if (offset === -1) return "left-near";
  if (offset === 1) return "right-near";
  if (offset === -2) return "left-far";
  if (offset === 2) return "right-far";
  return "back";
}

export function CollectibleSeriesStage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const activeToy = homeSeriesToys[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + homeSeriesToys.length) % homeSeriesToys.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % homeSeriesToys.length);
  };

  useEffect(() => {
    if (homeSeriesToys.length <= 1 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(showNext, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX;
    setPaused(true);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const startX = pointerStartX.current;
    pointerStartX.current = null;
    setPaused(false);
    if (startX === null) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) < 34) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  return (
    <section
      className="collection-stage"
      aria-labelledby="collection-stage-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="collection-stage__viewport"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
          setPaused(false);
        }}
      >
        <div className="collection-stage__meta">
          <span><LibraryBig size={15} /> {colorAnimalsSeries.name}</span>
          <strong>{String(activeIndex + 1).padStart(2, "0")} / {String(homeSeriesToys.length).padStart(2, "0")}</strong>
        </div>

        <div className="collection-stage__orbit" aria-label="Color Dog 系列玩偶">
          {homeSeriesToys.map((toy, index) => {
            if (index === activeIndex) return null;
            const position = getStagePosition(index, activeIndex);
            return (
              <button
                key={toy.id}
                type="button"
                className={`collection-stage__preview collection-stage__preview--${position}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`查看${toy.name}`}
              >
                <ToyThumbnail toy={toy} size="large" />
              </button>
            );
          })}

          <div className="collection-stage__hero" key={activeToy.id}>
            <ToyViewer toy={activeToy} variant="hero" interactive />
          </div>
        </div>

        {homeSeriesToys.length > 1 ? (
          <>
            <button
              type="button"
              className="collection-stage__arrow collection-stage__arrow--previous"
              onClick={showPrevious}
              aria-label="上一只玩偶"
              title="上一只玩偶"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="collection-stage__arrow collection-stage__arrow--next"
              onClick={showNext}
              aria-label="下一只玩偶"
              title="下一只玩偶"
            >
              <ChevronRight size={20} />
            </button>
          </>
        ) : null}
      </div>

      <div className="collection-stage__copy" aria-live="polite">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> 开启收藏时刻</p>
          <h1 id="collection-stage-title">{activeToy.name}</h1>
          <p>先认识这一只完整的 Color Dog：保留灵动眼睛与粉色细节，身体采用柔和磨砂换色。</p>
        </div>
        <ButtonLink to={routes.draw}>
          开始抽取 <ArrowRight size={18} />
        </ButtonLink>
      </div>

      {homeSeriesToys.length > 1 ? (
        <div className="collection-stage__pagination" aria-label="选择系列玩偶">
          {homeSeriesToys.map((toy, index) => (
            <button
              key={toy.id}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              aria-label={toy.name}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
