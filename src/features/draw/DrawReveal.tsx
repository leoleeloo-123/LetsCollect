import { CheckCircle2, Heart, LibraryBig, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMvpState } from "../../app/MvpState";
import { routes } from "../../app/routes";
import { ToyViewer } from "../../three/ToyViewer";
import type { Collectible } from "../../types/toy";
import { isSpecialExhibitCollectible } from "../toys/activeSeries";
import { getToyModel, getToyPalette } from "../toys/catalog";
import { getCollectibleMaterialLabel } from "../toys/presentation";

type DrawRevealProps = {
  toy: Collectible;
  onClose: () => void;
};

export function DrawReveal({ toy, onClose }: DrawRevealProps) {
  const { favoriteIds, toggleFavorite } = useMvpState();
  const model = getToyModel(toy.modelId);
  const palette = getToyPalette(toy.paletteId);
  const materialLabel = getCollectibleMaterialLabel(toy);
  const isFavorite = favoriteIds.includes(toy.id);

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
        className={`reveal-sheet reveal-sheet--companion reveal-sheet--${toy.rarity}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reveal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="icon-button reveal-sheet__close"
          type="button"
          onClick={onClose}
          aria-label="Close encounter"
        >
          <X size={20} />
        </button>
        <p className="eyebrow">
          {isSpecialExhibitCollectible(toy)
            ? "A crystal encounter"
            : "A new Companion found you"}
        </p>
        <div className="reveal-sheet__stage">
          <ToyViewer toy={toy} variant="inspect" />
        </div>
        <div className="reveal-sheet__copy">
          <p className="reveal-sheet__arrival-note">
            <CheckCircle2 size={15} aria-hidden="true" />
            Added to your Collection
          </p>
          <h2 id="reveal-title">{toy.name}</h2>
          <p className="reveal-sheet__description">{toy.shortDescription}</p>
          <dl className="reveal-sheet__facts">
            <div><dt>Companion</dt><dd>{model.name}</dd></div>
            <div><dt>Color</dt><dd>{palette.name}</dd></div>
            <div><dt>Finish</dt><dd>{materialLabel}</dd></div>
            <div><dt>Collection</dt><dd>{toy.seriesName}</dd></div>
          </dl>
        </div>
        <div className="reveal-sheet__actions">
          <Link className="primary-button" to={routes.collection} onClick={onClose}>
            <LibraryBig size={18} />
            View Collection
          </Link>
          <button
            className={`secondary-button favorite-button${isFavorite ? " is-favorite" : ""}`}
            type="button"
            aria-pressed={isFavorite}
            onClick={() => toggleFavorite(toy.id)}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            {isFavorite ? "Favorite saved" : "Set as Favorite"}
          </button>
          <button className="secondary-button" type="button" onClick={onClose}>
            <Sparkles size={17} />
            Meet another
          </button>
        </div>
      </section>
    </div>
  );
}
