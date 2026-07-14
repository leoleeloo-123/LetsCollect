import { Boxes, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useMvpState } from "../../app/MvpState";
import { ToyCard } from "../../components/cards/ToyCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { ToyDetailSheet } from "../../features/collection/ToyDetailSheet";
import { toyModels } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";

type CollectionFilter = "all" | "high" | "mythic";

export function CollectionPage() {
  const { collection } = useMvpState();
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [selectedToy, setSelectedToy] = useState<Collectible | null>(null);
  const modelCount = new Set(collection.map((toy) => toy.modelId)).size;
  const filteredToys = collection.filter((toy) => {
    if (filter === "mythic") return toy.rarity === "mythic";
    if (filter === "high") return ["epic", "legendary", "mythic"].includes(toy.rarity);
    return true;
  });

  return (
    <div className="page-stack collection-page">
      <PageHeader eyebrow="收藏" title="我的独立藏品" description="每只玩偶都有自己的编号、五维品质与可复现外观。" />

      <section className="collection-summary">
        <div><Boxes size={23} /><span>玉梦初遇</span></div>
        <strong>{collection.length}<small> 件</small></strong>
        <div className="collection-summary__bar" aria-label={`已遇见 ${modelCount} 种造型，共 ${toyModels.length} 种`}>
          <span style={{ width: `${(modelCount / toyModels.length) * 100}%` }} />
        </div>
        <p><CheckCircle2 size={16} /> 已遇见 {modelCount} / {toyModels.length} 种造型</p>
      </section>

      <div className="segmented-control" aria-label="收藏筛选">
        {(["all", "high", "mythic"] as CollectionFilter[]).map((value) => (
          <button
            key={value}
            type="button"
            className={filter === value ? "active" : ""}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === "all" ? "全部" : value === "high" ? "史诗以上" : "神话"}
          </button>
        ))}
      </div>

      {filteredToys.length > 0 ? (
        <div className="toy-grid toy-grid--collection">
          {filteredToys.map((toy) => (
            <ToyCard key={toy.id} toy={toy} onSelect={setSelectedToy} />
          ))}
        </div>
      ) : (
        <p className="collection-empty">这一档还没有藏品，下一次相遇也许就是它。</p>
      )}

      {selectedToy ? <ToyDetailSheet toy={selectedToy} onClose={() => setSelectedToy(null)} /> : null}
    </div>
  );
}
