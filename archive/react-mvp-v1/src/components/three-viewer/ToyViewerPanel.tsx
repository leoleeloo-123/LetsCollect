import { getCollectibleMaterialDescription } from "../../features/toys/presentation";
import type { Collectible } from "../../types/toy";
import { ToyViewer } from "../../three/ToyViewer";

type ToyViewerPanelProps = {
  title?: string;
  toy: Collectible;
};

export function ToyViewerPanel({ toy, title = "近距离检查" }: ToyViewerPanelProps) {
  const materialDescription = getCollectibleMaterialDescription(toy);
  return (
    <section className="viewer-panel" aria-label={title}>
      <div className="viewer-panel__stage">
        <ToyViewer toy={toy} variant="inspect" />
      </div>
      <div>
        <p className="eyebrow">3D 藏品</p>
        <h2>{title}</h2>
        <p>{materialDescription}</p>
      </div>
    </section>
  );
}
