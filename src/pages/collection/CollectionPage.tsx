import { Boxes, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useMvpState } from "../../app/MvpState";
import { ToyCard } from "../../components/cards/ToyCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { ToyDetailSheet } from "../../features/collection/ToyDetailSheet";
import { mockToys } from "../../data/mock/toys";
import type { Toy } from "../../types/toy";

type CollectionFilter = "all" | "owned" | "locked";

export function CollectionPage() {
  const { collectionCounts } = useMvpState();
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [selectedToy, setSelectedToy] = useState<Toy | null>(null);
  const ownedCount = mockToys.filter((toy) => (collectionCounts[toy.id] ?? 0) > 0).length;
  const filteredToys = mockToys.filter((toy) => {
    const owned = (collectionCounts[toy.id] ?? 0) > 0;
    return filter === "all" || (filter === "owned" ? owned : !owned);
  });

  return (
    <div className="page-stack collection-page">
      <PageHeader eyebrow="收藏" title="我的玉玩具柜" description="每一次相遇都会留在这里，慢慢组成属于你的系列。" />

      <section className="collection-summary">
        <div><Boxes size={23} /><span>玉梦初遇</span></div>
        <strong>{ownedCount}<small> / {mockToys.length}</small></strong>
        <div className="collection-summary__bar" aria-label={`已收藏 ${ownedCount} 件，共 ${mockToys.length} 件`}>
          <span style={{ width: `${(ownedCount / mockToys.length) * 100}%` }} />
        </div>
        <p><CheckCircle2 size={16} /> 已收集 {Math.round((ownedCount / mockToys.length) * 100)}%</p>
      </section>

      <div className="segmented-control" aria-label="收藏筛选">
        {(["all", "owned", "locked"] as CollectionFilter[]).map((value) => (
          <button
            key={value}
            type="button"
            className={filter === value ? "active" : ""}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === "all" ? "全部" : value === "owned" ? "已拥有" : "未解锁"}
          </button>
        ))}
      </div>

      <div className="toy-grid toy-grid--collection">
        {filteredToys.map((toy) => {
          const count = collectionCounts[toy.id] ?? 0;
          return (
            <ToyCard
              key={toy.id}
              toy={toy}
              count={count}
              locked={count === 0}
              onSelect={count > 0 ? setSelectedToy : undefined}
            />
          );
        })}
      </div>

      {selectedToy ? (
        <ToyDetailSheet
          toy={selectedToy}
          count={collectionCounts[selectedToy.id] ?? 0}
          onClose={() => setSelectedToy(null)}
        />
      ) : null}
    </div>
  );
}
