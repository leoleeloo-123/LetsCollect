import type { Toy } from "../../types/toy";

type ToyCardProps = {
  toy: Toy;
};

export function ToyCard({ toy }: ToyCardProps) {
  return (
    <article className="toy-card">
      <div className={`toy-card__preview toy-card__preview--${toy.rarity}`}>
        <span>{toy.name.slice(0, 1)}</span>
      </div>
      <div className="toy-card__body">
        <span className={`rarity-badge rarity-badge--${toy.rarity}`}>{toy.rarity}</span>
        <h3>{toy.name}</h3>
        <p>{toy.shortDescription}</p>
      </div>
    </article>
  );
}
