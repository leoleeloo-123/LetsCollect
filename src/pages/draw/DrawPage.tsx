import { CircleHelp, Sparkles, Ticket } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DRAW_COST, useMvpState } from "../../app/MvpState";
import { routes } from "../../app/routes";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { PageHeader } from "../../components/ui/PageHeader";
import { featuredOtter } from "../../data/mock/toys";
import { colorAnimalsSeries } from "../../features/toys/activeSeries";
import { DrawReveal } from "../../features/draw/DrawReveal";
import { ToyViewer } from "../../three/ToyViewer";
import type { Collectible } from "../../types/toy";
import "./draw-companion.css";

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
      setMessage("抽取券暂时不够。回到 Collect，稍后再来遇见新的 Companion。");
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
    <div className="page-stack draw-page draw-page--compact draw-page--companion">
      <PageHeader
        eyebrow="Encounter"
        title="Meet a Companion"
        description="一次安静的相遇：二十四只柔雾伙伴组成当前完整收藏系列。"
      />

      <section className={`draw-stage draw-stage--compact${isDrawing ? " draw-stage--active" : ""}`}>
        <div className="draw-stage__status">
          <span>Today’s encounter pool</span>
          <strong>{colorAnimalsSeries.drawModelIds.length} matte companions</strong>
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
          {isDrawing ? "A Companion is finding its way…" : "Who will you meet today?"}
          <span><Ticket size={16} /> {DRAW_COST}</span>
        </button>
        {message ? (
          <div className="draw-message" role="status">
            <span>{message}</span>
            <ButtonLink to={routes.home} variant="secondary">Back to Collect</ButtonLink>
          </div>
        ) : null}
      </section>

      <details className="probability-panel">
        <summary><CircleHelp size={18} /> Encounter details</summary>
        <div className="probability-panel__grid">
          <span>Matte companions 100%</span>
          <span>{colorAnimalsSeries.drawModelIds.length} companions · equal chance</span>
          <span>9 available matte colors</span>
          <span>Model-specific recolor zones</span>
        </div>
        <p>
          The twelve matte models and their nine verified colors share the
          current local encounter pool.
        </p>
      </details>

      {recentDraws.length > 0 ? (
        <section className="content-section">
          <div className="section-heading">
            <p className="eyebrow">Recent encounters</p>
            <h2>Already resting in your Collection</h2>
          </div>
          <div className="recent-draws">
            {recentDraws.map((draw) => {
              const collectible = collectionById.get(draw.collectibleId);
              return collectible ? (
                <ToyThumbnail key={draw.id} toy={collectible} size="small" />
              ) : null;
            })}
          </div>
        </section>
      ) : null}

      {result ? <DrawReveal toy={result} onClose={() => setResult(null)} /> : null}
    </div>
  );
}
