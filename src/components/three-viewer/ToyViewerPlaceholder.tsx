import type { Toy } from "../../types/toy";
import { ToyVisual } from "../toys/ToyVisual";

type ToyViewerPlaceholderProps = {
  title?: string;
  toy: Toy;
};

export function ToyViewerPlaceholder({ toy, title = "3D 查看器" }: ToyViewerPlaceholderProps) {
  return (
    <section className="viewer-placeholder" aria-label={title}>
      <div className="viewer-placeholder__stage">
        <ToyVisual toy={toy} size="large" />
        <span className="viewer-placeholder__hint">视觉预览</span>
      </div>
      <div>
        <p className="eyebrow">藏品检查</p>
        <h2>{title}</h2>
        <p>
          这里将用于近距离旋转、观察材质与查看藏品细节。
        </p>
      </div>
    </section>
  );
}
