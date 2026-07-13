import { LockKeyhole } from "lucide-react";
import type { Toy } from "../../types/toy";
import { ToyVisual } from "../toys/ToyVisual";

type ToyCardProps = {
  toy: Toy;
  count?: number;
  locked?: boolean;
  onSelect?: (toy: Toy) => void;
};

const rarityLabels = {
  common: "普通",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
  mythic: "神话"
} as const;

export function ToyCard({ toy, count = 0, locked = false, onSelect }: ToyCardProps) {
  const content = (
    <>
      <div className={`toy-card__preview toy-card__preview--${toy.rarity}`}>
        <ToyVisual toy={toy} locked={locked} />
        {locked ? (
          <span className="toy-card__lock" aria-hidden="true">
            <LockKeyhole size={16} />
          </span>
        ) : null}
      </div>
      <div className="toy-card__body">
        <span className={`rarity-badge rarity-badge--${toy.rarity}`}>
          {rarityLabels[toy.rarity]}
        </span>
        <h3>{locked ? "尚未解锁" : toy.name}</h3>
        <p>{locked ? `${toy.seriesName} · 等待相遇` : `${toy.jadeGrade} · ${toy.colorName}`}</p>
        {!locked && count > 1 ? <span className="toy-card__count">×{count}</span> : null}
      </div>
    </>
  );

  return onSelect && !locked ? (
    <button className="toy-card toy-card--button" type="button" onClick={() => onSelect(toy)}>
      {content}
    </button>
  ) : (
    <article className={`toy-card${locked ? " toy-card--locked" : ""}`}>{content}</article>
  );
}
