import { useState } from "react";
import { useMvpState } from "../../app/MvpState";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { ToyDetailSheet } from "../../features/collection/ToyDetailSheet";
import { rarityLabels } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";

type CollectionFilter = "all" | "high" | "mythic";

export function CollectionPage() {
  const { collection } = useMvpState();
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [selectedToy, setSelectedToy] = useState<Collectible | null>(null);
  const filteredToys = collection.filter((toy) => {
    if (filter === "mythic") return toy.rarity === "mythic";
    if (filter === "high") return ["epic", "legendary", "mythic"].includes(toy.rarity);
    return true;
  });

  return (
    <div className="page-stack collection-page">
      <div className="segmented-control" aria-label="收藏筛选">
        {(["all", "high", "mythic"] as CollectionFilter[]).map((value) => (
          <button
            key={value}
            type="button"
            className={filter === value ? "active" : ""}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === "all" ? `全部 ${collection.length}` : value === "high" ? "史诗以上" : "神话"}
          </button>
        ))}
      </div>

      {filteredToys.length > 0 ? (
        <section className="collection-figures" aria-label="我的玩偶收藏">
          {filteredToys.map((toy) => (
            <button
              key={toy.id}
              className="collection-figure"
              type="button"
              onClick={() => setSelectedToy(toy)}
              aria-label={`查看 ${toy.name} 的 3D 详情`}
            >
              <span className="collection-figure__visual">
                <ToyThumbnail toy={toy} className="collection-figure__thumbnail" />
              </span>
              <span className="collection-figure__caption">
                <strong>{toy.name}</strong>
                <small>
                  <span className={`collection-figure__rarity collection-figure__rarity--${toy.rarity}`} />
                  {rarityLabels[toy.rarity]} · {toy.qualityScore}
                </small>
              </span>
            </button>
          ))}
        </section>
      ) : (
        <p className="collection-empty">这一档还没有藏品，下一次相遇也许就是它。</p>
      )}

      {selectedToy ? <ToyDetailSheet toy={selectedToy} onClose={() => setSelectedToy(null)} /> : null}
    </div>
  );
}
