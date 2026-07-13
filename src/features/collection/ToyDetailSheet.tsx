import { Box, X } from "lucide-react";
import { useEffect } from "react";
import type { Toy } from "../../types/toy";
import { ToyViewerPlaceholder } from "../../components/three-viewer/ToyViewerPlaceholder";

type ToyDetailSheetProps = {
  toy: Toy;
  count: number;
  onClose: () => void;
};

const rarityLabels = {
  common: "普通",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
  mythic: "神话"
} as const;

export function ToyDetailSheet({ toy, count, onClose }: ToyDetailSheetProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="detail-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="detail-sheet__header">
          <div>
            <p className="eyebrow">藏品详情</p>
            <h2 id="detail-title">{toy.name}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭详情">
            <X size={20} />
          </button>
        </header>
        <div className="detail-sheet__content">
          <ToyViewerPlaceholder toy={toy} title="3D 检查即将开放" />
          <div className="detail-sheet__metadata">
            <dl className="metadata-list">
              <div><dt>系列</dt><dd>{toy.seriesName}</dd></div>
              <div><dt>稀有度</dt><dd>{rarityLabels[toy.rarity]}</dd></div>
              <div><dt>玉质</dt><dd>{toy.jadeGrade}</dd></div>
              <div><dt>色泽</dt><dd>{toy.colorName}</dd></div>
              <div><dt>拥有数量</dt><dd>{count}</dd></div>
            </dl>
            <div className="implementation-note">
              <Box size={18} />
              <p>{toy.assets.modelUrl ? "这只藏品的 3D 版本正在准备中。" : "当前先展示藏品外观，3D 版本会在后续开放。"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
