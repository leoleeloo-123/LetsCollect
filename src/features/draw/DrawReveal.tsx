import { LibraryBig, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import type { Toy } from "../../types/toy";
import { ToyVisual } from "../../components/toys/ToyVisual";

type DrawRevealProps = {
  toy: Toy;
  onClose: () => void;
};

export function DrawReveal({ toy, onClose }: DrawRevealProps) {
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
        <p className="eyebrow">新的相遇</p>
        <div className="reveal-sheet__stage">
          <ToyVisual toy={toy} size="large" />
        </div>
        <div className="reveal-sheet__copy">
          <span className={`rarity-badge rarity-badge--${toy.rarity}`}>{toy.seriesName}</span>
          <h2 id="reveal-title">{toy.name}</h2>
          <p>{toy.shortDescription}</p>
          <dl className="metadata-list metadata-list--compact">
            <div><dt>玉质</dt><dd>{toy.jadeGrade}</dd></div>
            <div><dt>色泽</dt><dd>{toy.colorName}</dd></div>
          </dl>
        </div>
        <div className="reveal-sheet__actions">
          <Link className="primary-button" to={routes.collection} onClick={onClose}>
            <LibraryBig size={18} />
            查看收藏
          </Link>
          <button className="secondary-button" type="button" onClick={onClose}>继续看看</button>
        </div>
      </section>
    </div>
  );
}
