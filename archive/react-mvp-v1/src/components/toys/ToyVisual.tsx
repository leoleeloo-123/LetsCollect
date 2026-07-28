import type { CSSProperties } from "react";
import { getToyModel } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";

type ToyVisualProps = {
  toy: Collectible;
  size?: "small" | "medium" | "large";
};

type ToyVisualStyle = CSSProperties & {
  "--toy-saturation": number;
  "--toy-brightness": number;
  "--toy-body-opacity": number;
};

export function ToyVisual({ toy, size = "medium" }: ToyVisualProps) {
  const model = getToyModel(toy.modelId);
  const style: ToyVisualStyle = {
    "--toy-saturation": 0.78 + toy.appearance.colorDepth * 0.006,
    "--toy-brightness": 1.1 - toy.appearance.colorDepth * 0.002,
    "--toy-body-opacity": toy.materialId === "jade"
      ? 0.72 + toy.appearance.transparency * 0.0025
      : toy.materialId === "glass" ? 0.72 : toy.materialId === "crystal" ? 0.82 : 1
  };

  return (
    <div
      className={`toy-visual toy-visual--${size} toy-visual--${model.fallbackShape} toy-visual--${toy.paletteId} toy-visual--material-${toy.materialId}`}
      role="img"
      aria-label={toy.name}
      style={style}
    >
      <div className="toy-visual__figure" aria-hidden="true">
        <span className="toy-visual__horn" />
        <span className="toy-visual__mane" />
        <span className="toy-visual__ear toy-visual__ear--left" />
        <span className="toy-visual__ear toy-visual__ear--right" />
        <span className="toy-visual__body" />
        <span className="toy-visual__head">
          <span className="toy-visual__eye toy-visual__eye--left" />
          <span className="toy-visual__eye toy-visual__eye--right" />
          <span className="toy-visual__snout" />
        </span>
        <span className="toy-visual__arm toy-visual__arm--left" />
        <span className="toy-visual__arm toy-visual__arm--right" />
        <span className="toy-visual__foot toy-visual__foot--left" />
        <span className="toy-visual__foot toy-visual__foot--right" />
        <span className="toy-visual__tail" />
      </div>
    </div>
  );
}
