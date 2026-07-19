import { CircleHelp, Sparkles, Ticket } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DRAW_COST, useMvpState } from "../../app/MvpState";
import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { PageHeader } from "../../components/ui/PageHeader";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { featuredToy } from "../../data/mock/toys";
import { DrawReveal } from "../../features/draw/DrawReveal";
import { getToyModel, getToyPalette } from "../../features/toys/catalog";
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
        <PageHeader eyebrow="抽取" title="软萌变色伙伴" description="同一只柔雾小狗，每次会遇见一种新的身体配色；眼睛、鼻嘴和粉色肉球始终保留。" />
        <TicketBalance />
      </div>

      <section className={`draw-stage${isDrawing ? " draw-stage--active" : ""}`}>
        <div className="draw-stage__status">
          <span>V3 色彩藏品生成</span>
          <strong>1 种造型 × 9 种配色</strong>
        </div>
        <div className="draw-stage__visual">
          <span className="draw-stage__halo" aria-hidden="true" />
          <ToyViewer toy={featuredToy} active={!result} />
        </div>
        <div className="draw-stage__copy">
          <p className="eyebrow">本期配色池</p>
          <h2>柔雾小狗配色室</h2>
          <p>{featuredModel.name}示例 · {featuredPalette.name}身体色 · 每次配色独立生成</p>
        </div>
        <button className="draw-button" type="button" onClick={handleDraw} disabled={isDrawing}>
          <Sparkles size={20} />
          {isDrawing ? "正在挑选新的配色..." : "随机生成一只小狗"}
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
        <summary><CircleHelp size={18} /> 查看 V3 配色规则</summary>
        <div className="probability-panel__grid">
          <span>每种配色约 11.1%</span><span>柔雾表面固定</span><span>五官细节固定</span>
        </div>
        <p>九种身体配色等概率出现，表面始终保持柔雾树脂效果；品质只记录这只玩偶的细节完成度，表面质感不会随机改变。</p>
      </details>

      {recentDraws.length > 0 ? (
        <section className="content-section">
          <div className="section-heading"><p className="eyebrow">最近相遇</p><h2>刚加入收藏</h2></div>
          <div className="recent-draws">
            {recentDraws.map((draw) => {
              const collectible = collectionById.get(draw.collectibleId);
              return collectible ? <ToyThumbnail key={draw.id} toy={collectible} size="small" /> : null;
            })}
          </div>
        </section>
      ) : null}

      {result ? <DrawReveal toy={result} onClose={() => setResult(null)} /> : null}
    </div>
  );
}
