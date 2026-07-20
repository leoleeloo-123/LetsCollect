import { useState } from "react";
import {
  Award,
  BookOpenCheck,
  CalendarDays,
  Dog,
  LayoutGrid,
  Medal,
  Palette,
  Trophy
} from "lucide-react";
import { useMvpState } from "../../app/MvpState";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { collectorProfile } from "../../data/mock/community";
import { homeSeriesToys } from "../../data/mock/homeSeries";
import { ToyDetailSheet } from "../../features/collection/ToyDetailSheet";
import { colorAnimalsSeries } from "../../features/toys/activeSeries";
import { colorAnimalModels, colorAnimalPalettes, rarityLabels } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import "./collector-profile.css";

type ProfileSection = "showcase" | "atlas" | "achievements";

export function CollectorProfilePage() {
  const { collection } = useMvpState();
  const [activeSection, setActiveSection] = useState<ProfileSection>("showcase");
  const [selectedToy, setSelectedToy] = useState<Collectible | null>(null);

  const distinctPalettes = new Set(collection.map((toy) => toy.paletteId));
  const colorProgress = distinctPalettes.size;
  const colorCompletion = Math.round((colorProgress / colorAnimalPalettes.length) * 100);
  const distinctModels = new Set(collection.map((toy) => toy.modelId));
  const modelProgress = distinctModels.size;
  const collectorLevel = Math.max(1, Math.floor(collection.length / 4) + 1);
  const completedSetCount = Number(colorProgress >= colorAnimalPalettes.length);
  const achievementCount = 1
    + Number(colorProgress >= 4)
    + Number(completedSetCount > 0);

  return (
    <div className="page-stack collection-page profile-hub-page">
      <section className="profile-overview-card" aria-labelledby="collector-name">
        <div className="profile-overview-card__topline">
          <div className="profile-overview-card__avatar" aria-hidden="true">
            {collectorProfile.initial}
          </div>
          <div className="profile-overview-card__identity">
            <div className="profile-overview-card__name-row">
              <h1 id="collector-name">{collectorProfile.name}</h1>
              <span>{collectorProfile.handle}</span>
            </div>
            <p>{collectorProfile.bio}</p>
            <small><CalendarDays size={14} /> {collectorProfile.joinedLabel}</small>
          </div>
          <div className="profile-overview-card__rank" aria-label={`收藏等级 ${collectorLevel}`}>
            <Medal size={18} aria-hidden="true" />
            <span>等级</span>
            <strong>{collectorLevel}</strong>
          </div>
        </div>

        <div className="profile-overview-card__title">
          <span>{collectorProfile.title}</span>
          <span>Color Animals · V3</span>
        </div>

        <dl className="profile-overview-card__stats">
          <div><dt>藏品数量</dt><dd>{collection.length}<span>件</span></dd></div>
          <div><dt>图鉴完成度</dt><dd>{colorCompletion}<span>%</span></dd></div>
          <div><dt>已获成就</dt><dd>{achievementCount}<span>/3</span></dd></div>
        </dl>
      </section>

      <nav className="profile-section-switch" aria-label="个人主页内容切换">
        <button
          type="button"
          className={activeSection === "showcase" ? "is-active" : ""}
          aria-pressed={activeSection === "showcase"}
          onClick={() => setActiveSection("showcase")}
        >
          <LayoutGrid size={17} aria-hidden="true" /> 展柜 <span>{collection.length}</span>
        </button>
        <button
          type="button"
          className={activeSection === "atlas" ? "is-active" : ""}
          aria-pressed={activeSection === "atlas"}
          onClick={() => setActiveSection("atlas")}
        >
          <BookOpenCheck size={17} aria-hidden="true" /> 图鉴 <span>{colorProgress}/{colorAnimalPalettes.length}</span>
        </button>
        <button
          type="button"
          className={activeSection === "achievements" ? "is-active" : ""}
          aria-pressed={activeSection === "achievements"}
          onClick={() => setActiveSection("achievements")}
        >
          <Trophy size={17} aria-hidden="true" /> 成就 <span>{achievementCount}/3</span>
        </button>
      </nav>

      {activeSection === "showcase" ? (
        <section className="profile-section-panel profile-showcase-panel" aria-labelledby="profile-showcase-title">
          <header className="profile-section-panel__heading profile-subsection__heading">
            <div>
              <p className="eyebrow">COLLECTION</p>
              <h2 id="profile-showcase-title">全部藏品</h2>
            </div>
            <small>{collection.length} 件</small>
          </header>

          {collection.length > 0 ? (
            <div className="collection-figures profile-showcase-grid" aria-label="我的玩偶收藏">
              {collection.map((toy) => (
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
            <p className="profile-empty-state">你的第一只收藏小动物会出现在这里。</p>
          )}
        </section>
      ) : null}

      {activeSection === "atlas" ? (
        <section className="profile-section-panel" aria-labelledby="profile-atlas-title">
          <header className="profile-section-panel__heading">
            <div><p className="eyebrow">ATLAS</p><h2 id="profile-atlas-title">收藏图鉴</h2></div>
            <BookOpenCheck size={21} aria-hidden="true" />
          </header>

          <section className="profile-atlas-progress" aria-label={`系列配色图鉴完成 ${colorCompletion}%`}>
            <div>
              <span>九色配色图鉴</span>
              <strong>{colorProgress}<small> / {colorAnimalPalettes.length}</small></strong>
              <p>再收集 {Math.max(colorAnimalPalettes.length - colorProgress, 0)} 种配色即可完成整套色卡。</p>
            </div>
            <div className="profile-atlas-progress__bar" aria-hidden="true">
              <span style={{ width: `${colorCompletion}%` }} />
            </div>
          </section>

          <section className="profile-subsection" aria-labelledby="palette-atlas-title">
            <div className="profile-subsection__heading">
              <div><span>COLOR MAP</span><h3 id="palette-atlas-title">九色收藏进度</h3></div>
              <small>{colorCompletion}% 完成</small>
            </div>
            <div className="profile-palette-grid">
              {colorAnimalPalettes.map((palette) => {
                const collected = distinctPalettes.has(palette.id);
                return (
                  <article key={palette.id} className={collected ? "is-collected" : ""}>
                    <span style={{ backgroundColor: palette.color }} aria-hidden="true" />
                    <strong>{palette.name}</strong>
                    <small>{collected ? "已收藏" : "待发现"}</small>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="profile-subsection" aria-labelledby="model-atlas-title">
            <div className="profile-subsection__heading">
              <div><span>MODELS</span><h3 id="model-atlas-title">伙伴造型图鉴</h3></div>
              <small>{modelProgress}/{colorAnimalModels.length} 已解锁</small>
            </div>
            <div className="profile-model-grid">
              {colorAnimalModels.map((model) => {
                const collected = distinctModels.has(model.id);
                const representative = homeSeriesToys.find((toy) => toy.modelId === model.id);
                return (
                  <article key={model.id} className={collected ? "is-collected" : ""}>
                    <div className="profile-model-grid__visual">
                      {representative ? <ToyThumbnail toy={representative} size="small" /> : null}
                    </div>
                    <div>
                      <strong>{model.name}</strong>
                      <small>{collected ? "已收藏" : "待发现"}</small>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="profile-subsection" aria-labelledby="series-atlas-title">
            <div className="profile-subsection__heading">
              <div><span>SERIES</span><h3 id="series-atlas-title">系列图鉴</h3></div>
            </div>
            <div className="collector-set-list">
              <article className="collector-set">
                <span className="collector-set__icon collector-set__icon--crystal"><Palette size={21} /></span>
                <div className="collector-set__copy">
                  <div><strong>九色配色图鉴</strong><span>{colorProgress}/{colorAnimalPalettes.length}</span></div>
                  <p>收集九种配色，并应用在不同的软萌伙伴上。</p>
                  <div className="collector-set__bar"><span style={{ width: `${colorCompletion}%` }} /></div>
                </div>
              </article>
              <article className="collector-set">
                <span className="collector-set__icon collector-set__icon--unicorn"><Dog size={21} /></span>
                <div className="collector-set__copy">
                  <div><strong>软萌伙伴系列</strong><span>{modelProgress}/{colorAnimalsSeries.modelIds.length}</span></div>
                  <p>小狗、小鸟、小熊、小兔和小猫已经组成首发伙伴阵容。</p>
                  <div className="collector-set__bar"><span style={{ width: `${modelProgress / colorAnimalsSeries.modelIds.length * 100}%` }} /></div>
                </div>
              </article>
            </div>
          </section>
        </section>
      ) : null}

      {activeSection === "achievements" ? (
        <section className="profile-section-panel" aria-labelledby="profile-achievements-title">
          <header className="profile-section-panel__heading">
            <div><p className="eyebrow">ACHIEVEMENTS</p><h2 id="profile-achievements-title">收藏成就</h2></div>
            <Trophy size={21} aria-hidden="true" />
          </header>

          <section className="profile-achievement-summary">
            <div><span>已点亮</span><strong>{achievementCount}<small> / 3</small></strong></div>
            <p>每一次相遇都会沉淀成个人主页上的收藏印记。</p>
          </section>

          <div className="achievement-list profile-achievement-list">
            <article className="is-unlocked">
              <span><Award size={22} /></span><strong>初次相遇</strong><small>拥有第一件藏品</small><em>已获得</em>
            </article>
            <article className={colorProgress >= 4 ? "is-unlocked" : ""}>
              <span><Palette size={22} /></span><strong>配色收藏家</strong><small>拥有四种身体配色</small>
              <em>{colorProgress >= 4 ? "已获得" : `${colorProgress}/4`}</em>
            </article>
            <article className={completedSetCount > 0 ? "is-unlocked" : ""}>
              <span><Trophy size={22} /></span><strong>完整色卡</strong><small>集齐九种系列配色</small>
              <em>{completedSetCount > 0 ? "已获得" : `${colorProgress}/${colorAnimalPalettes.length}`}</em>
            </article>
          </div>
        </section>
      ) : null}

      {selectedToy ? <ToyDetailSheet toy={selectedToy} onClose={() => setSelectedToy(null)} /> : null}
    </div>
  );
}
