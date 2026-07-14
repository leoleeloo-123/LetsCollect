import { CircleHelp, Sparkles, Ticket } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DRAW_COST, useMvpState } from "../../app/MvpState";
import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { PageHeader } from "../../components/ui/PageHeader";
import { ToyVisual } from "../../components/toys/ToyVisual";
import { featuredToy } from "../../data/mock/toys";
import { DrawReveal } from "../../features/draw/DrawReveal";
import { getToyModel, getToyPalette, rarityLabels } from "../../features/toys/catalog";
import { TicketBalance } from "../../features/tickets/TicketBalance";
import { ToyViewer } from "../../three/ToyViewer";
import type { Collectible } from "../../types/toy";

export function DrawPage() {
  const { collection, drawCollectible, recentDraws } = useMvpState();
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<Collectible | null>(null);
  const [message, setMessage] = useState("");
  const revealTimer = useRef<number | null>(null);
  const featuredPalette = getToyPalette(featuredToy.paletteId);
  const featuredModel = getToyModel(featuredToy.modelId);
  const collectionById = useMemo(
    () => new Map(collection.map((collectible) => [collectible.id, collectible])),
    [collection]
  );

  useEffect(() => () => {
    if (revealTimer.current) window.clearTimeout(revealTimer.current);
  }, []);

  function handleDraw() {
    const collectible = drawCollectible();
    if (!collectible) {
      setMessage("抽取券不够了，回首页完成一次好友互动即可继续。");
      return;
    }

    setMessage("");
    setIsDrawing(true);
    revealTimer.current = window.setTimeout(() => {
      setResult(collectible);
      setIsDrawing(false);
    }, 850);
  }

  return (
    <div className="page-stack draw-page">
      <div className="page-title-row">
        <PageHeader eyebrow="抽取" title="玉梦初遇" description="六种造型、八种色泽与五维材质，共同决定每一次独特相遇。" />
        <TicketBalance />
      </div>

      <section className={`draw-stage${isDrawing ? " draw-stage--active" : ""}`}>
        <div className="draw-stage__status">
          <span>V1 独立藏品生成</span>
          <strong>6 × 8 × 五维参数</strong>
        </div>
        <div className="draw-stage__visual">
          <span className="draw-stage__halo" aria-hidden="true" />
          <ToyViewer toy={featuredToy} active={!result} />
        </div>
        <div className="draw-stage__copy">
          <p className="eyebrow">本期模型池</p>
          <h2>果冻玉玩偶实验室</h2>
          <p>{featuredModel.name}示例 · {featuredPalette.name} · 每次参数独立生成</p>
        </div>
        <button className="draw-button" type="button" onClick={handleDraw} disabled={isDrawing}>
          <Sparkles size={20} />
          {isDrawing ? "正在生成五维参数..." : "抽取独立藏品"}
          <span><Ticket size={16} /> {DRAW_COST}</span>
        </button>
        {message ? (
          <div className="draw-message" role="status">
            <span>{message}</span>
            <ButtonLink to={routes.home} variant="secondary">去互动</ButtonLink>
          </div>
        ) : null}
      </section>

      <details className="probability-panel">
        <summary><CircleHelp size={18} /> 查看 V1 品质概率</summary>
        <div className="probability-panel__grid">
          <span>普通约 55%</span><span>稀有约 28%</span><span>史诗约 11%</span><span>传说约 5%</span><span>神话约 1%</span>
        </div>
        <p>模型和颜色等概率。{rarityLabels.mythic}等稀有度由五维品质综合计算，不单独随机。</p>
      </details>

      {recentDraws.length > 0 ? (
        <section className="content-section">
          <div className="section-heading"><p className="eyebrow">最近相遇</p><h2>刚加入收藏</h2></div>
          <div className="recent-draws">
            {recentDraws.map((draw) => {
              const collectible = collectionById.get(draw.collectibleId);
              return collectible ? <ToyVisual key={draw.id} toy={collectible} size="small" /> : null;
            })}
          </div>
        </section>
      ) : null}

      {result ? <DrawReveal toy={result} onClose={() => setResult(null)} /> : null}
    </div>
  );
}
