import { ArrowRight, Sparkles, Ticket } from "lucide-react";
import { routes } from "../../app/routes";
import { useMvpState } from "../../app/MvpState";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { ToyViewer } from "../../three/ToyViewer";
import { ActivityCard } from "../../features/feed/ActivityCard";
import { mockActivities } from "../../data/mock/social";
import { featuredToy } from "../../data/mock/toys";
import { rarityLabels } from "../../features/toys/catalog";

export function HomePage() {
  const { interactedActivityIds } = useMvpState();
  const completedInteractions = mockActivities.filter((activity) =>
    interactedActivityIds.includes(activity.id)
  ).length;

  return (
    <div className="page-stack home-page">
      <section className="feature-spotlight">
        <div className="feature-spotlight__copy">
          <p className="eyebrow">本周主题 · 玉梦初遇</p>
          <h1>今天，和朋友一起遇见新藏品</h1>
          <p>{featuredToy.shortDescription}</p>
          <ButtonLink to={routes.draw}>
            去抽取 <ArrowRight size={18} />
          </ButtonLink>
        </div>
        <div className="feature-spotlight__stage">
          <ToyViewer toy={featuredToy} variant="hero" />
          <span className="feature-spotlight__rarity">{rarityLabels[featuredToy.rarity]}</span>
        </div>
      </section>

      <section className="daily-progress" aria-label="今日互动进度">
        <div className="daily-progress__icon"><Ticket size={20} /></div>
        <div className="daily-progress__copy">
          <strong>今日互动奖励</strong>
          <span>为朋友的新藏品送上喜欢，获得抽取券</span>
        </div>
        <div className="daily-progress__value">
          <strong>{completedInteractions}/{mockActivities.length}</strong>
          <span>已完成</span>
        </div>
        <div className="daily-progress__bar" aria-hidden="true">
          <span style={{ width: `${Math.min(completedInteractions / mockActivities.length, 1) * 100}%` }} />
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading section-heading--inline">
          <div>
            <p className="eyebrow">朋友新动态</p>
            <h2>一起收藏，会更有意思</h2>
          </div>
          <Sparkles size={22} aria-hidden="true" />
        </div>
        <div className="activity-list">
          {mockActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </div>
  );
}
