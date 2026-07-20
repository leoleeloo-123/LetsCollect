import {
  ArrowRight,
  LibraryBig,
  Sparkles
} from "lucide-react";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { homeSeriesToys } from "../../data/mock/homeSeries";
import { ToyViewer } from "../../three/ToyViewer";
import { colorAnimalsSeries } from "../toys/activeSeries";
import "./home-first-viewport.css";

type SwipeSession = {
  pointerId: number;
  startX: number;
  startY: number;
};

export function CollectibleSeriesStage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const swipeSessionRef = useRef<SwipeSession | null>(null);
  const activeToy = homeSeriesToys[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + homeSeriesToys.length) % homeSeriesToys.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % homeSeriesToys.length);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (homeSeriesToys.length <= 1 || (event.target as HTMLElement).closest("button")) return;
    swipeSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const finishSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = swipeSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const distanceX = event.clientX - session.startX;
    const distanceY = event.clientY - session.startY;
    swipeSessionRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (Math.abs(distanceX) < 36 || Math.abs(distanceX) <= Math.abs(distanceY) * 1.2) return;
    if (distanceX > 0) showPrevious();
    else showNext();
  };

  const cancelSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeSessionRef.current?.pointerId !== event.pointerId) return;
    swipeSessionRef.current = null;
  };

  return (
    <section
      className="collection-stage collection-stage--compact"
      aria-labelledby="collection-stage-title"
    >
      <div
        className="collection-stage__viewport"
        aria-label={`第 ${activeIndex + 1} 只，共 ${homeSeriesToys.length} 只。左右滑动切换玩偶。`}
        onPointerDown={handlePointerDown}
        onPointerUp={finishSwipe}
        onPointerCancel={cancelSwipe}
      >
        <div className="collection-stage__meta">
          <span><LibraryBig size={14} /> {colorAnimalsSeries.name}</span>
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
          ) : <span aria-hidden="true" />}
          <strong>{String(activeIndex + 1).padStart(2, "0")} / {String(homeSeriesToys.length).padStart(2, "0")}</strong>
        </div>

        <div className="collection-stage__orbit">
          <div className="collection-stage__hero" key={activeToy.id}>
            <ToyViewer
              toy={activeToy}
              variant="hero"
              interactive={false}
              autoRotate="continuous"
            />
          </div>
        </div>
      </div>

      <div className="collection-stage__copy" aria-live="polite">
        <p className="eyebrow"><Sparkles size={14} /> 开启收藏时刻</p>
        <div className="collection-stage__title-row">
          <h1 id="collection-stage-title">{activeToy.name}</h1>
          <ButtonLink to={routes.draw}>
            开始抽取 <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}