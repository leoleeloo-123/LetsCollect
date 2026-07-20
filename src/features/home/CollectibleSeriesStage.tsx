import { ArrowRight, LibraryBig, Sparkles } from "lucide-react";
import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { homeSeriesToys } from "../../data/mock/homeSeries";
import { ToyViewer } from "../../three/ToyViewer";
import { colorAnimalsSeries } from "../toys/activeSeries";
import { getToyModel } from "../toys/catalog";
import { useSharedToyRotation } from "./useSharedToyRotation";

export function CollectibleSeriesStage() {
  const {
    controller,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown
  } = useSharedToyRotation();

  return (
    <section
      className="collection-stage collection-stage--compact"
      aria-labelledby="collection-stage-title"
    >
      <div
        className="collection-stage__viewport"
        role="group"
        tabIndex={0}
        aria-label={`${homeSeriesToys.length} 款可旋转 3D 软萌变色玩偶。左右拖动可同步旋转全部玩偶。`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        <div className="collection-stage__meta">
          <span><LibraryBig size={14} /> {colorAnimalsSeries.name}</span>
          <strong>{homeSeriesToys.length} 款</strong>
        </div>

        <div className="collection-stage__model-grid">
          {homeSeriesToys.map((toy) => (
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
      </div>

      <div className="collection-stage__copy">
        <p className="eyebrow"><Sparkles size={14} /> 开启收藏时刻</p>
        <div className="collection-stage__title-row">
          <h1 id="collection-stage-title">六款软萌变色伙伴</h1>
          <ButtonLink to={routes.draw}>
            开始抽取 <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}