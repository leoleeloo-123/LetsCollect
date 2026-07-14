import { LibraryBig, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { AppearanceVector } from "../../components/collectibles/AppearanceVector";
import { getToyModel, getToyPalette, rarityLabels } from "../toys/catalog";
import type { Collectible } from "../../types/toy";
import { ToyViewer } from "../../three/ToyViewer";

type DrawRevealProps = {
  toy: Collectible;
  onClose: () => void;
};

export function DrawReveal({ toy, onClose }: DrawRevealProps) {
  const model = getToyModel(toy.modelId);
  const palette = getToyPalette(toy.paletteId);

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
        className={`reveal-sheet reveal-sheet--${toy.rarity}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reveal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button reveal-sheet__close" type="button" onClick={onClose} aria-label="关闭">
          <X size={20} />
        </button>
        <p className="eyebrow">新的独立藏品</p>
        <div className="reveal-sheet__stage">
          <ToyViewer toy={toy} variant="inspect" />
        </div>
        <div className="reveal-sheet__copy">
          <div className="reveal-sheet__quality">
            <span className={`rarity-badge rarity-badge--${toy.rarity}`}>{rarityLabels[toy.rarity]}</span>
            <strong>{toy.qualityScore}<small> / 100</small></strong>
          </div>
          <h2 id="reveal-title">{toy.name}</h2>
          <p>{toy.publicCode} · {model.name} · {palette.name} · {toy.jadeGrade}</p>
          <AppearanceVector collectible={toy} compact />
        </div>
        <div className="reveal-sheet__actions">
          <Link className="primary-button" to={routes.collection} onClick={onClose}>
            <LibraryBig size={18} />
            查看收藏
          </Link>
          <button className="secondary-button" type="button" onClick={onClose}>继续抽取</button>
        </div>
      </section>
    </div>
  );
}
