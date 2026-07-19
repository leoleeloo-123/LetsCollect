import { useMemo, useState } from "react";
import {
  Award,
  BookOpenCheck,
  CalendarDays,
  Dog,
  Medal,
  Palette,
  ScanSearch,
  Star,
  Trophy
} from "lucide-react";
import { useMvpState } from "../../app/MvpState";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { collectorProfile } from "../../data/mock/community";
import { ToyDetailSheet } from "../../features/collection/ToyDetailSheet";
import { colorAnimalPalettes, rarityLabels } from "../../features/toys/catalog";
import { colorAnimalsSeries } from "../../features/toys/activeSeries";
import { ToyViewer } from "../../three/ToyViewer";
import type { Collectible } from "../../types/toy";

type CollectionFilter = "all" | "high" | "mythic";

function pickPinnedToys(collection: Collectible[]) {
  const preferredIds = ["toy_001", "toy_002", "toy_003"];
  const selected = preferredIds
    .map((id) => collection.find((toy) => toy.id === id))
    .filter((toy): toy is Collectible => Boolean(toy));

  for (const toy of collection) {
    if (selected.length >= 3) break;
    if (!selected.some((item) => item.id === toy.id)) selected.push(toy);
  }

  return selected.slice(0, 3);
}

export function CollectorProfilePage() {
  const { collection } = useMvpState();
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [selectedToy, setSelectedToy] = useState<Collectible | null>(null);

  const favoriteToy = collection[0];
  const pinnedToys = useMemo(() => pickPinnedToys(collection), [collection]);
  const mythicCount = collection.filter((toy) => toy.rarity === "mythic").length;
  const distinctPalettes = new Set(collection.map((toy) => toy.paletteId)).size;
  const collectorLevel = Math.max(1, Math.floor(collection.length / 4));
  const colorProgress = distinctPalettes;
  const modelProgress = new Set(collection.map((toy) => toy.modelId)).size;
  const completedSetCount = Number(colorProgress >= colorAnimalPalettes.length);
  const filteredToys = collection.filter((toy) => {
    if (filter === "mythic") return toy.rarity === "mythic";
    if (filter === "high") return ["epic", "legendary", "mythic"].includes(toy.rarity);
    return true;
  });

  return (
    <div className="page-stack collection-page collector-profile-page">
      <section className="collector-identity" aria-labelledby="collector-name">
        <div className="collector-identity__avatar" aria-hidden="true">
          {collectorProfile.initial}
        </div>
        <div className="collector-identity__copy">
          <span>{collectorProfile.handle}</span>
          <h1 id="collector-name">{collectorProfile.title}</h1>
          <p>{collectorProfile.bio}</p>
          <small><CalendarDays size={14} /> {collectorProfile.joinedLabel}</small>
        </div>
        <div className="collector-identity__level">
          <Medal size={19} aria-hidden="true" />
          <span>收藏等级</span>
          <strong>{collectorLevel}</strong>
        </div>
        <dl className="collector-stats">
          <div><dt>藏品</dt><dd>{collection.length}</dd></div>
          <div><dt>神话</dt><dd>{mythicCount}</dd></div>
          <div><dt>完成图鉴</dt><dd>{completedSetCount}</dd></div>
        </dl>
      </section>

      {favoriteToy ? (
        <section className="content-section collector-showcase" aria-labelledby="showcase-title">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="eyebrow">我的展柜</p>
              <h2 id="showcase-title">代表藏品与置顶收藏</h2>
            </div>
            <Star size={22} aria-hidden="true" />
          </div>
          <div className="collector-showcase__layout">
            <div className="collector-showcase__feature">
              <div className="collector-showcase__stage">
                <ToyViewer toy={favoriteToy} variant="stage" />
              </div>
              <div className="collector-showcase__feature-copy">
                <div>
                  <span>代表藏品</span>
                  <strong>{favoriteToy.name}</strong>
                  <small>{favoriteToy.publicCode} · 品质 {favoriteToy.qualityScore}</small>
                </div>
                <button type="button" onClick={() => setSelectedToy(favoriteToy)}>
                  <ScanSearch size={17} /> 查看档案
                </button>
              </div>
            </div>
            <div className="collector-pins" aria-label="置顶藏品">
              {pinnedToys.map((toy, index) => (
                <button key={toy.id} type="button" onClick={() => setSelectedToy(toy)}>
                  <span className="collector-pin__index">0{index + 1}</span>
                  <ToyThumbnail toy={toy} size="small" />
                  <span>
                    <strong>{toy.name}</strong>
                    <small>{rarityLabels[toy.rarity]} · {toy.qualityScore}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="content-section collector-sets" aria-labelledby="sets-title">
        <div className="section-heading section-heading--inline">
          <div>
            <p className="eyebrow">收藏图鉴</p>
            <h2 id="sets-title">同一只小狗，也能组成丰富色卡</h2>
          </div>
          <BookOpenCheck size={22} aria-hidden="true" />
        </div>
        <div className="collector-set-list">
          <article className="collector-set">
            <span className="collector-set__icon collector-set__icon--crystal"><Palette size={21} /></span>
            <div className="collector-set__copy">
              <div><strong>小狗配色图鉴</strong><span>{colorProgress}/{colorAnimalPalettes.length}</span></div>
              <p>收集九种不同身体配色的柔雾小狗。</p>
              <div className="collector-set__bar"><span style={{ width: `${colorProgress / colorAnimalPalettes.length * 100}%` }} /></div>
            </div>
          </article>
          <article className="collector-set">
            <span className="collector-set__icon collector-set__icon--unicorn"><Dog size={21} /></span>
            <div className="collector-set__copy">
              <div><strong>软萌伙伴系列</strong><span>{modelProgress}/{colorAnimalsSeries.modelIds.length}</span></div>
              <p>首发 Color Dog 已到位，后续小鸟与泰迪会逐步加入。</p>
              <div className="collector-set__bar"><span style={{ width: `${modelProgress / colorAnimalsSeries.modelIds.length * 100}%` }} /></div>
            </div>
          </article>
        </div>
      </section>

      <section className="content-section collector-achievements" aria-labelledby="achievements-title">
        <div className="section-heading section-heading--inline">
          <div>
            <p className="eyebrow">展示成就</p>
            <h2 id="achievements-title">这些徽章也是收藏的一部分</h2>
          </div>
          <Trophy size={22} aria-hidden="true" />
        </div>
        <div className="achievement-list">
          <article>
            <span><Award size={22} /></span>
            <strong>初次相遇</strong>
            <small>拥有第一件藏品</small>
          </article>
          <article className={distinctPalettes >= 4 ? "is-unlocked" : ""}>
            <span><Palette size={22} /></span>
            <strong>配色收藏家</strong>
            <small>拥有四种身体配色</small>
          </article>
          <article className={completedSetCount > 0 ? "is-unlocked" : ""}>
            <span><Trophy size={22} /></span>
            <strong>完整色卡</strong>
            <small>集齐九种小狗配色</small>
          </article>
        </div>
      </section>

      <section className="content-section collector-library" aria-labelledby="collection-library-title">
        <div className="section-heading section-heading--inline">
          <div>
            <p className="eyebrow">全部收藏</p>
            <h2 id="collection-library-title">我的软萌展柜</h2>
          </div>
          <span>{filteredToys.length} 件</span>
        </div>
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
          <div className="collection-figures" aria-label="我的玩偶收藏">
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
          </div>
        ) : (
          <p className="collection-empty">这一档还没有藏品，下一次相遇也许就是它。</p>
        )}
      </section>

      {selectedToy ? <ToyDetailSheet toy={selectedToy} onClose={() => setSelectedToy(null)} /> : null}
    </div>
  );
}
