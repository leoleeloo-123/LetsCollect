import { useMemo, useState } from "react";
import { Sparkles, Star, X } from "lucide-react";
import { useMvpState } from "../../app/MvpState";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { productCopy } from "../../content/productCopy";
import { ToyDetailSheet } from "../../features/collection/ToyDetailSheet";
import {
  deriveCollectionSignature
} from "../../features/collection/collectionSignature";
import {
  getToyModel,
  getToyPalette,
  rarityLabels
} from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import "./collection-v2.css";

const REPRESENTATIVE_SLOT_KEYS = [
  "representative-slot-1",
  "representative-slot-2",
  "representative-slot-3"
] as const;

export function CollectorProfilePage() {
  const {
    collection,
    favoriteIds,
    representativeIds,
    toggleRepresentative
  } = useMvpState();
  const [selectedToy, setSelectedToy] = useState<Collectible | null>(null);

  const collectionById = useMemo(
    () => new Map(collection.map((toy) => [toy.id, toy])),
    [collection]
  );
  const representativeToys = useMemo(
    () => representativeIds
      .map((id) => collectionById.get(id))
      .filter((toy): toy is Collectible => toy !== undefined),
    [collectionById, representativeIds]
  );
  const signature = useMemo(
    () => deriveCollectionSignature({
      collection,
      favoriteIds,
      representativeIds
    }),
    [collection, favoriteIds, representativeIds]
  );

  return (
    <div className="page-stack collection-page collection-v2">
      <header className="collection-v2__hero">
        <div className="collection-v2__hero-copy">
          <p className="eyebrow">{productCopy.collection.eyebrow}</p>
          <h1>{productCopy.collection.title}</h1>
          <p>
            选择最能代表你的 Companion，也看看颜色与材质如何在一次次相遇中，
            慢慢形成属于当前收藏的气质。
          </p>
        </div>
        <dl className="collection-v2__stats">
          <div>
            <dt>Companions</dt>
            <dd>{collection.length}<span>件</span></dd>
          </div>
          <div>
            <dt>Favorites</dt>
            <dd>{favoriteIds.length}<span>件</span></dd>
          </div>
          <div>
            <dt>Representatives</dt>
            <dd>{representativeToys.length}<span>/ 3</span></dd>
          </div>
        </dl>
      </header>

      <section
        className="collection-v2__panel collection-v2__signature"
        aria-labelledby="collection-signature-title"
      >
        <div className="collection-v2__section-heading">
          <div>
            <p className="eyebrow">Collection Signature</p>
            <h2 id="collection-signature-title">最近的收藏倾向</h2>
          </div>
          <Sparkles size={22} aria-hidden="true" />
        </div>
        <div className="collection-v2__signature-layout">
          <div>
            <div
              className="collection-v2__signature-tags"
              aria-label="收藏倾向标签"
            >
              {signature.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <p className="collection-v2__signature-description">
              {signature.description}
            </p>
          </div>
          <ul
            className="collection-v2__signature-evidence"
            aria-label="标签生成依据"
          >
            {signature.evidence.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section
        className="collection-v2__panel"
        aria-labelledby="representative-companions-title"
      >
        <div className="collection-v2__section-heading">
          <div>
            <p className="eyebrow">Representative Companions</p>
            <h2 id="representative-companions-title">最能代表你的三次相遇</h2>
          </div>
          <small aria-live="polite">
            {representativeToys.length} / 3 已选择
          </small>
        </div>
        <div className="collection-v2__representative-grid">
          {REPRESENTATIVE_SLOT_KEYS.map((slotKey, index) => {
            const toy = representativeToys[index];
            if (!toy) {
              return (
                <a
                  className="collection-v2__representative-empty"
                  href="#collection-library"
                  key={slotKey}
                  aria-label={`选择第 ${index + 1} 只代表 Companion`}
                >
                  <Star size={20} aria-hidden="true" />
                  <strong>Choose a Companion</strong>
                </a>
              );
            }

            return (
              <article
                className="collection-v2__representative"
                key={slotKey}
              >
                <button
                  className="collection-v2__representative-visual"
                  type="button"
                  onClick={() => setSelectedToy(toy)}
                  aria-label={`查看代表藏品 ${toy.name} 的 3D 详情`}
                >
                  <ToyThumbnail toy={toy} size="card" />
                  <span
                    className="collection-v2__representative-rank"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                </button>
                <div className="collection-v2__representative-copy">
                  <strong>{toy.name}</strong>
                  <small>
                    {getToyModel(toy.modelId).name}
                    {" · "}
                    {getToyPalette(toy.paletteId).name}
                  </small>
                </div>
                <button
                  className="collection-v2__remove-representative"
                  type="button"
                  onClick={() => toggleRepresentative(toy.id)}
                  aria-label={`不再将 ${toy.name} 设为代表藏品`}
                >
                  <X size={13} aria-hidden="true" />
                  Remove
                </button>
              </article>
            );
          })}
        </div>
        <p className="collection-v2__representative-note">
          这三只 Companion 会成为未来 Echo 首先看到的收藏表达；你可以随时更换，
          不需要上传真人头像。
        </p>
      </section>

      <section
        className="profile-section-panel profile-showcase-panel"
        id="collection-library"
        aria-labelledby="collection-library-title"
      >
        <header className="profile-section-panel__heading profile-subsection__heading">
          <div>
            <p className="eyebrow">COLLECTION</p>
            <h2 id="collection-library-title">全部藏品</h2>
          </div>
          <small>{collection.length} 件</small>
        </header>

        {collection.length > 0 ? (
          <div
            className="collection-figures profile-showcase-grid"
            aria-label="我的玩偶收藏"
          >
            {collection.map((toy) => (
              <button
                key={toy.id}
                className="collection-figure"
                type="button"
                onClick={() => setSelectedToy(toy)}
                aria-label={`查看 ${toy.name} 的 3D 详情`}
              >
                <span className="collection-figure__visual">
                  <ToyThumbnail
                    toy={toy}
                    className="collection-figure__thumbnail"
                  />
                </span>
                <span className="collection-figure__caption">
                  <strong>{toy.name}</strong>
                  <small>
                    <span
                      className={
                        `collection-figure__rarity `
                        + `collection-figure__rarity--${toy.rarity}`
                      }
                    />
                    {rarityLabels[toy.rarity]} · {toy.qualityScore}
                  </small>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="profile-empty-state">
            你的第一只收藏小动物会出现在这里。
          </p>
        )}
      </section>

      {selectedToy ? (
        <ToyDetailSheet
          toy={selectedToy}
          onClose={() => setSelectedToy(null)}
        />
      ) : null}
    </div>
  );
}
