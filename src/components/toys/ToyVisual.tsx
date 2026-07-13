import type { Toy } from "../../types/toy";

type ToyVisualProps = {
  toy: Toy;
  size?: "small" | "medium" | "large";
  locked?: boolean;
};

export function ToyVisual({ toy, size = "medium", locked = false }: ToyVisualProps) {
  return (
    <div
      className={`toy-visual toy-visual--${size} toy-visual--${toy.baseType} toy-visual--${toy.palette}${locked ? " toy-visual--locked" : ""}`}
      role="img"
      aria-label={locked ? `尚未获得的${toy.name}` : toy.name}
    >
      <div className="toy-visual__figure" aria-hidden="true">
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
