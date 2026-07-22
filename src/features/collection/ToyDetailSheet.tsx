import { X } from "lucide-react";
import { useEffect } from "react";
import { AppearanceVector } from "../../components/collectibles/AppearanceVector";
import { ToyViewerPanel } from "../../components/three-viewer/ToyViewerPanel";
import { getToyModel, getToyPalette, rarityLabels } from "../toys/catalog";
import { isColorAnimalCollectible } from "../toys/activeSeries";
import { getCollectibleGradeLabel } from "../toys/compatibility";
import { getCollectibleMaterialLabel, getCollectiblePaletteLabel } from "../toys/presentation";
import type { Collectible } from "../../types/toy";

type ToyDetailSheetProps = {
  toy: Collectible;
  onClose: () => void;
};

export function ToyDetailSheet({ toy, onClose }: ToyDetailSheetProps) {
  const model = getToyModel(toy.modelId);
  const palette = getToyPalette(toy.paletteId);
  const materialLabel = getCollectibleMaterialLabel(toy);
  const paletteFieldLabel = getCollectiblePaletteLabel(toy);
  const grade = getCollectibleGradeLabel(toy);
  const gradeFieldLabel = isColorAnimalCollectible(toy)
    ? "配色等级"
    : toy.materialId === "jade" ? "通透档位" : "品相";

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
            <p className="eyebrow">{toy.publicCode}</p>
            <h2 id="detail-title">{toy.name}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭详情">
            <X size={20} />
          </button>
        </header>
        <div className="detail-sheet__content">
          <ToyViewerPanel toy={toy} title="近距离检查" />
          <div className="detail-sheet__metadata">
            <div className="detail-sheet__score">
              <span className={`rarity-badge rarity-badge--${toy.rarity}`}>{rarityLabels[toy.rarity]}</span>
              <strong>{toy.qualityScore}<small> / 100</small></strong>
            </div>
            <AppearanceVector collectible={toy} />
            <dl className="metadata-list">
              <div><dt>造型</dt><dd>{model.name}</dd></div>
              <div><dt>表面</dt><dd>{materialLabel}</dd></div>
              <div><dt>{paletteFieldLabel}</dt><dd>{palette.name}</dd></div>
              <div><dt>{gradeFieldLabel}</dt><dd>{toy.materialId === "jade" ? ["T", toy.transparencyGrade ?? "-", " · ", grade].join("") : grade}</dd></div>
              <div><dt>外观种子</dt><dd>{toy.appearanceSeed}</dd></div>
              <div><dt>生成规则</dt><dd>V{toy.generationVersion}</dd></div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
