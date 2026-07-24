import { useMemo, useState } from "react";
import {
  CalendarDays,
  Heart,
  Rotate3D,
  SlidersHorizontal,
  Sparkles,
  Star,
  X
} from "lucide-react";
import { useMvpState } from "../../app/MvpState";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { productCopy } from "../../content/productCopy";
import { ToyDetailSheet } from "../../features/collection/ToyDetailSheet";
import {
  deriveCollectionSignature
} from "../../features/collection/collectionSignature";
import { isSpecialExhibitCollectible } from "../../features/toys/activeSeries";
import {
  getToyModel,
  getToyPalette
} from "../../features/toys/catalog";
import {
  getCollectibleMaterialLabel,
  getCollectiblePaletteLabel
} from "../../features/toys/presentation";
import type {
  Collectible,
  ToyModelId,
  ToyPaletteId
} from "../../types/toy";
import "./collection-v2.css";

type ModelFilter = "all" | ToyModelId;
type ColorFilter = "all" | ToyPaletteId;
type MaterialFilter = "all" | "matte" | "crystal";
type AcquisitionFilter = "all" | "last-7" | "last-30";
type AcquisitionOrder = "newest" | "oldest";

const REPRESENTATIVE_SLOT_KEYS = [
  "representative-slot-1",
  "representative-slot-2",
  "representative-slot-3"
] as const;
const ACQUISITION_FILTER_DAYS: Record<
  Exclude<AcquisitionFilter, "all">,
  number
> = {
  "last-7": 7,
  "last-30": 30
};
const acquiredDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric"
});

function getTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatAcquisitionDate(value: string) {
  const timestamp = getTimestamp(value);
  return timestamp > 0
    ? acquiredDateFormatter.format(new Date(timestamp))
    : "日期未知";
}

function getMaterialCategory(toy: Collectible): Exclude<
  MaterialFilter,
  "all"
> {
  return isSpecialExhibitCollectible(toy) ? "crystal" : "matte";
}

export function CollectorProfilePage() {
  const {
    collection,
    favoriteIds,
    representativeIds,
    toggleFavorite,
    toggleRepresentative
  } = useMvpState();
  const [selectedToy, setSelectedToy] = useState<Collectible | null>(null);
  const [modelFilter, setModelFilter] = useState<ModelFilter>("all");
  const [colorFilter, setColorFilter] = useState<ColorFilter>("all");
  const [materialFilter, setMaterialFilter] =
    useState<MaterialFilter>("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [acquisitionFilter, setAcquisitionFilter] =
    useState<AcquisitionFilter>("all");
  const [acquisitionOrder, setAcquisitionOrder] =
    useState<AcquisitionOrder>("newest");

  const collectionById = useMemo(
    () => new Map(collection.map((toy) => [toy.id, toy])),
    [collection]
  );
  const favoriteIdSet = useMemo(
    () => new Set(favoriteIds),
    [favoriteIds]
  );
  const representativeIdSet = useMemo(
    () => new Set(representativeIds),
    [representativeIds]
  );
  const representativeToys = useMemo(
    () => representativeIds
      .map((id) => collectionById.get(id))
      .filter((toy): toy is Collectible => toy !== undefined),
    [collectionById, representativeIds]
  );
  const modelOptions = useMemo(
    () => [...new Set(collection.map((toy) => toy.modelId))]
      .map((modelId) => getToyModel(modelId))
      .sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
    [collection]
  );
  const colorOptions = useMemo(
    () => [...new Set(collection.map((toy) => toy.paletteId))]
      .map((paletteId) => getToyPalette(paletteId))
      .sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
    [collection]
  );
  const signature = useMemo(
    () => deriveCollectionSignature({
      collection,
      favoriteIds,
      representativeIds
    }),
    [collection, favoriteIds, representativeIds]
  );
  const filteredCollection = useMemo(() => {
    const cutoff = acquisitionFilter === "all"
      ? null
      : Date.now()
        - ACQUISITION_FILTER_DAYS[acquisitionFilter] * 24 * 60 * 60 * 1000;

    return collection
      .filter((toy) => modelFilter === "all" || toy.modelId === modelFilter)
      .filter((toy) => colorFilter === "all" || toy.paletteId === colorFilter)
      .filter((toy) =>
        materialFilter === "all"
        || getMaterialCategory(toy) === materialFilter
      )
      .filter((toy) => !favoriteOnly || favoriteIdSet.has(toy.id))
      .filter((toy) => cutoff === null || getTimestamp(toy.createdAt) >= cutoff)
      .sort((left, right) => {
        const difference =
          getTimestamp(right.createdAt) - getTimestamp(left.createdAt);
        return acquisitionOrder === "newest" ? difference : -difference;
      });
  }, [
    acquisitionFilter,
    acquisitionOrder,
    collection,
    colorFilter,
    favoriteIdSet,
    favoriteOnly,
    materialFilter,
    modelFilter
  ]);
  const activeFilterCount =
    Number(modelFilter !== "all")
    + Number(colorFilter !== "all")
    + Number(materialFilter !== "all")
    + Number(favoriteOnly)
    + Number(acquisitionFilter !== "all");
  const representativeSelectionFull = representativeIds.length >= 3;

  function resetFilters() {
    setModelFilter("all");
    setColorFilter("all");
    setMaterialFilter("all");
    setFavoriteOnly(false);
    setAcquisitionFilter("all");
    setAcquisitionOrder("newest");
  }

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
        className="collection-v2__panel"
        id="collection-library"
        aria-labelledby="collection-library-title"
      >
        <div className="collection-v2__section-heading">
          <div>
            <p className="eyebrow">Collection Grid</p>
            <h2 id="collection-library-title">全部藏品</h2>
          </div>
          <small aria-live="polite">
            显示 {filteredCollection.length} / {collection.length} 件
          </small>
        </div>

        <div className="collection-v2__filters" aria-label="收藏筛选">
          <div className="collection-v2__filters-heading">
            <strong>
              <SlidersHorizontal size={15} aria-hidden="true" />
              Filters
              {activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
            </strong>
            <button
              type="button"
              onClick={resetFilters}
              disabled={activeFilterCount === 0 && acquisitionOrder === "newest"}
            >
              Clear
            </button>
          </div>
          <div className="collection-v2__filter-grid">
            <label className="collection-v2__filter">
              <span>Model</span>
              <select
                value={modelFilter}
                onChange={(event) =>
                  setModelFilter(event.target.value as ModelFilter)
                }
              >
                <option value="all">All models</option>
                {modelOptions.map((model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </label>
            <label className="collection-v2__filter">
              <span>Color</span>
              <select
                value={colorFilter}
                onChange={(event) =>
                  setColorFilter(event.target.value as ColorFilter)
                }
              >
                <option value="all">All colorways</option>
                {colorOptions.map((palette) => (
                  <option key={palette.id} value={palette.id}>
                    {palette.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="collection-v2__filter">
              <span>Material</span>
              <select
                value={materialFilter}
                onChange={(event) =>
                  setMaterialFilter(event.target.value as MaterialFilter)
                }
              >
                <option value="all">All materials</option>
                <option value="matte">Soft matte resin</option>
                <option value="crystal">Faceted crystal</option>
              </select>
            </label>
            <div className="collection-v2__filter">
              <span>Favorite</span>
              <button
                className="collection-v2__favorite-filter"
                type="button"
                aria-pressed={favoriteOnly}
                onClick={() => setFavoriteOnly((value) => !value)}
              >
                <Heart
                  size={14}
                  fill={favoriteOnly ? "currentColor" : "none"}
                  aria-hidden="true"
                />
                Favorites only
              </button>
            </div>
            <label className="collection-v2__filter">
              <span>Acquired</span>
              <select
                value={acquisitionFilter}
                onChange={(event) =>
                  setAcquisitionFilter(
                    event.target.value as AcquisitionFilter
                  )
                }
              >
                <option value="all">Any time</option>
                <option value="last-7">Last 7 days</option>
                <option value="last-30">Last 30 days</option>
              </select>
            </label>
            <label className="collection-v2__filter">
              <span>Date order</span>
              <select
                value={acquisitionOrder}
                onChange={(event) =>
                  setAcquisitionOrder(event.target.value as AcquisitionOrder)
                }
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>
        </div>

        {filteredCollection.length > 0 ? (
          <div className="collection-v2__grid" aria-label="筛选后的收藏">
            {filteredCollection.map((toy) => {
              const isFavorite = favoriteIdSet.has(toy.id);
              const isRepresentative = representativeIdSet.has(toy.id);
              const representativeDisabled =
                representativeSelectionFull && !isRepresentative;
              const model = getToyModel(toy.modelId);
              const palette = getToyPalette(toy.paletteId);

              return (
                <article
                  className={
                    `collection-v2__card`
                    + (isRepresentative ? " is-representative" : "")
                  }
                  key={toy.id}
                >
                  <button
                    className="collection-v2__card-visual"
                    type="button"
                    onClick={() => setSelectedToy(toy)}
                    aria-label={`查看 ${toy.name} 的 3D 详情`}
                  >
                    <ToyThumbnail toy={toy} size="card" />
                    <span className="collection-v2__card-material">
                      {getCollectibleMaterialLabel(toy)}
                    </span>
                  </button>
                  <div className="collection-v2__card-body">
                    <div className="collection-v2__card-title">
                      <h3>{toy.name}</h3>
                      <p>{toy.publicCode}</p>
                    </div>
                    <div
                      className="collection-v2__card-meta"
                      aria-label={`${toy.name} 的真实元数据`}
                    >
                      <span>{model.name}</span>
                      <span>
                        {getCollectiblePaletteLabel(toy)} · {palette.name}
                      </span>
                      <span>{getCollectibleMaterialLabel(toy)}</span>
                    </div>
                    <time
                      className="collection-v2__card-date"
                      dateTime={toy.createdAt}
                    >
                      <CalendarDays size={12} aria-hidden="true" />
                      获得于 {formatAcquisitionDate(toy.createdAt)}
                    </time>
                    <div className="collection-v2__card-actions">
                      <button
                        type="button"
                        aria-pressed={isFavorite}
                        onClick={() => toggleFavorite(toy.id)}
                        aria-label={
                          isFavorite
                            ? `取消收藏 ${toy.name}`
                            : `将 ${toy.name} 设为 Favorite`
                        }
                      >
                        <Heart
                          size={13}
                          fill={isFavorite ? "currentColor" : "none"}
                          aria-hidden="true"
                        />
                        Favorite
                      </button>
                      <button
                        type="button"
                        aria-pressed={isRepresentative}
                        disabled={representativeDisabled}
                        onClick={() => toggleRepresentative(toy.id)}
                        aria-label={
                          isRepresentative
                            ? `不再将 ${toy.name} 设为代表藏品`
                            : `将 ${toy.name} 设为代表藏品`
                        }
                        title={
                          representativeDisabled
                            ? "最多可以选择 3 只代表 Companion"
                            : undefined
                        }
                      >
                        <Star
                          size={13}
                          fill={isRepresentative ? "currentColor" : "none"}
                          aria-hidden="true"
                        />
                        Representative
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedToy(toy)}
                        aria-label={`打开 ${toy.name} 的 3D 查看器`}
                      >
                        <Rotate3D size={13} aria-hidden="true" />
                        View 3D
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="collection-v2__empty" role="status">
            <strong>没有符合这些条件的藏品</strong>
            <p>试着放宽 Model、Color、Material、Favorite 或获得时间筛选。</p>
            <button type="button" onClick={resetFilters}>Clear filters</button>
          </div>
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
