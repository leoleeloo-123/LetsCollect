import { CircleHelp, Sparkles, Ticket } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DRAW_COST, useMvpState } from "../../app/MvpState";
import { routes } from "../../app/routes";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { PageHeader } from "../../components/ui/PageHeader";
import { featuredOtter } from "../../data/mock/toys";
import { colorAnimalsSeries, specialExhibitsSeries } from "../../features/toys/activeSeries";
import { DrawReveal } from "../../features/draw/DrawReveal";
import { ToyViewer } from "../../three/ToyViewer";
import type { Collectible } from "../../types/toy";

export function DrawPage() {
  const { collection, drawCollectible, recentDraws } = useMvpState();
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<Collectible | null>(null);
  const [message, setMessage] = useState("");
  const revealTimer = useRef<number | null>(null);
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
    <div className="page-stack draw-page draw-page--compact">
      <PageHeader
        eyebrow="抽取"
        title="软萌变色伙伴"
        description="随机遇见六款软萌变色伙伴，并有 5% 概率发现 Diamond Unicorn 特殊展品。"
      />

      <section className={`draw-stage draw-stage--compact${isDrawing ? " draw-stage--active" : ""}`}>
        <div className="draw-stage__status">
          <span>本期收藏池</span>
          <strong>{colorAnimalsSeries.drawModelIds.length} 种常规造型 + 1 件特殊展品</strong>
        </div>
        <div className="draw-stage__visual">
          <ToyViewer
            toy={featuredOtter}
            variant="hero"
            interactive={false}
            autoRotate="continuous"
            active={!result}
          />
        </div>
        <button className="draw-button" type="button" onClick={handleDraw} disabled={isDrawing}>
          <Sparkles size={20} />
          {isDrawing ? "正在挑选新伙伴..." : "随机抽取一只玩偶"}
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
        <summary><CircleHelp size={18} /> 查看本期抽取规则</summary>
        <div className="probability-panel__grid">
          <span>常规伙伴 95%</span><span>Diamond Unicorn {specialExhibitsSeries.drawProbability * 100}%</span><span>常规九种配色</span><span>钻石五种色泽</span>
        </div>
        <p>95% 概率抽到六款常规伙伴，六种造型与九种配色均匀随机；另有 5% 概率发现 Diamond Unicorn，随机呈现五种钻石色泽。</p>
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
