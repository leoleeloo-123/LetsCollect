import { rarityLabels } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import { ToyThumbnail } from "../toys/ToyThumbnail";

type ToyCardProps = {
  toy: Collectible;
  onSelect?: (toy: Collectible) => void;
};

export function ToyCard({ toy, onSelect }: ToyCardProps) {
  const content = (
    <>
      <div className={`toy-card__preview toy-card__preview--${toy.rarity}`}>
        <ToyThumbnail toy={toy} />
        <span className="toy-card__score" aria-label={`综合品质 ${toy.qualityScore} 分`}>
          {toy.qualityScore}
        </span>
      </div>
      <div className="toy-card__body">
        <span className={`rarity-badge rarity-badge--${toy.rarity}`}>
          {rarityLabels[toy.rarity]}
        </span>
        <h3>{toy.name}</h3>
        <p>{toy.jadeGrade} · 通透 {toy.appearance.transparency}</p>
        <span className="toy-card__code">{toy.publicCode}</span>
      </div>
    </>
  );

  return onSelect ? (
    <button className="toy-card toy-card--button" type="button" onClick={() => onSelect(toy)}>
      {content}
    </button>
  ) : (
    <article className="toy-card">{content}</article>
  );
}
