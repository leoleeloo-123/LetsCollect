import { CircleHelp, Sparkles, Ticket } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DRAW_COST, useMvpState } from "../../app/MvpState";
import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { PageHeader } from "../../components/ui/PageHeader";
import { ToyVisual } from "../../components/toys/ToyVisual";
import { ToyViewer } from "../../three/ToyViewer";
import { DrawReveal } from "../../features/draw/DrawReveal";
import { TicketBalance } from "../../features/tickets/TicketBalance";
import { featuredToy, toyById } from "../../data/mock/toys";
import type { Toy } from "../../types/toy";

export function DrawPage() {
  const { drawToy, recentDrawIds } = useMvpState();
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<Toy | null>(null);
  const [message, setMessage] = useState("");
  const revealTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (revealTimer.current) window.clearTimeout(revealTimer.current);
  }, []);

  function handleDraw() {
    const toy = drawToy();
    if (!toy) {
      setMessage("抽取券不够了，回首页完成一次好友互动即可继续。");
      return;
    }

    setMessage("");
    setIsDrawing(true);
    revealTimer.current = window.setTimeout(() => {
      setResult(toy);
      setIsDrawing(false);
    }, 850);
  }

  return (
    <div className="page-stack draw-page">
      <div className="page-title-row">
        <PageHeader eyebrow="抽取" title="玉梦初遇" description="每一次抽取，都是一只新的果冻玉玩偶与你相遇。" />
        <TicketBalance />
      </div>

      <section className={`draw-stage${isDrawing ? " draw-stage--active" : ""}`}>
        <div className="draw-stage__status">
          <span>限时系列</span>
          <strong>剩余 06 天</strong>
        </div>
        <div className="draw-stage__visual">
          <span className="draw-stage__halo" aria-hidden="true" />
          <ToyViewer toy={featuredToy} active={!result} />
        </div>
        <div className="draw-stage__copy">
          <p className="eyebrow">本期核心藏品</p>
          <h2>{featuredToy.name}</h2>
          <p>神话级 · {featuredToy.jadeGrade} · {featuredToy.colorName}</p>
        </div>
        <button className="draw-button" type="button" onClick={handleDraw} disabled={isDrawing}>
          <Sparkles size={20} />
          {isDrawing ? "正在揭晓..." : "抽取一次"}
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
        <summary><CircleHelp size={18} /> 查看演示概率</summary>
        <div className="probability-panel__grid">
          <span>普通 38%</span><span>稀有 42%</span><span>史诗 12%</span><span>传说 6%</span><span>神话 2%</span>
        </div>
        <p>当前为前端 Mock 抽取，仅用于验证流程，不代表未来正式概率。</p>
      </details>

      {recentDrawIds.length > 0 ? (
        <section className="content-section">
          <div className="section-heading"><p className="eyebrow">最近相遇</p><h2>刚加入收藏</h2></div>
          <div className="recent-draws">
            {recentDrawIds.map((toyId, index) => {
              const toy = toyById.get(toyId);
              return toy ? <ToyVisual key={`${toyId}-${index}`} toy={toy} size="small" /> : null;
            })}
          </div>
        </section>
      ) : null}

      {result ? <DrawReveal toy={result} onClose={() => setResult(null)} /> : null}
    </div>
  );
}
