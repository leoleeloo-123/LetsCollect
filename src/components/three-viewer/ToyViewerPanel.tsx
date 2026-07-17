import { getToyMaterial } from "../../features/toys/materialCatalog";
import type { Collectible } from "../../types/toy";
import { ToyViewer } from "../../three/ToyViewer";

type ToyViewerPanelProps = {
  title?: string;
  toy: Collectible;
};

export function ToyViewerPanel({ toy, title = "近距离检查" }: ToyViewerPanelProps) {
  const material = getToyMaterial(toy.materialId);
  const materialDescription = toy.materialId === "jade"
    ? "果冻玉材质会随着观察角度呈现不同的透光与色泽。"
    : `${material.name}材质会随着观察角度呈现不同的表面细节与反射。`;
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
