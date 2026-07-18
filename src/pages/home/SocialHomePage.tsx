import {
  ArrowRight,
  Check,
  Circle,
  Compass,
  Sparkles,
  Ticket,
  UsersRound
} from "lucide-react";
import { routes } from "../../app/routes";
import { useMvpState } from "../../app/MvpState";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { communityEvents } from "../../data/mock/community";
import { mockToys } from "../../data/mock/toys";
import { CommunityEventCard } from "../../features/feed/CommunityEventCard";
import { ToyViewer } from "../../three/ToyViewer";

export function SocialHomePage() {
  const { interactedActivityIds, interactAndEarn } = useMvpState();
  const focusEvent = communityEvents[0];
  const focusToy = mockToys.find((toy) => toy.id === focusEvent.toyId) ?? mockToys[0];
  const completedInteractions = communityEvents.filter((event) =>
    interactedActivityIds.includes(event.id)
  ).length;
  const focusClaimed = interactedActivityIds.includes(focusEvent.id);
  const ritualComplete = completedInteractions === communityEvents.length;

  return (
    <div className="page-stack social-home-page">
      <section className="community-spotlight" aria-labelledby="community-focus-title">
        <div className="community-spotlight__copy">
          <div className="community-spotlight__person">
            <span aria-hidden="true">{focusEvent.userInitial}</span>
            <div>
              <strong>{focusEvent.userName}</strong>
              <small>{focusEvent.eventLabel} · {focusEvent.timeLabel}</small>
            </div>
          </div>
          <p className="eyebrow">今天的收藏时刻</p>
          <h1 id="community-focus-title">她完成了水晶动物图鉴</h1>
          <p>六种造型全部点亮。朋友的收藏里程碑，也值得被认真看见。</p>
          <div className="community-spotlight__actions">
            <button
              className={focusClaimed ? "primary-button is-claimed" : "primary-button"}
              type="button"
              disabled={focusClaimed}
              onClick={() => interactAndEarn(focusEvent.id, focusEvent.reward)}
            >
              {focusClaimed ? <Check size={18} /> : <Sparkles size={18} />}
              {focusClaimed ? "已送上欧气" : "送上欧气 · +1 券"}
            </button>
            <ButtonLink to={routes.draw} variant="secondary">
              本期抽取 <ArrowRight size={17} />
            </ButtonLink>
          </div>
        </div>
        <div className="community-spotlight__stage">
          <ToyViewer toy={focusToy} variant="hero" />
          <span className="community-spotlight__caption">
            {focusToy.name}<small>{focusToy.publicCode}</small>
          </span>
        </div>
      </section>

      <section className="collector-ritual" aria-label="今日收藏仪式">
        <div className="collector-ritual__heading">
          <div>
            <p className="eyebrow">今日收藏仪式</p>
            <h2>{ritualComplete ? "今天的心意都送到了" : "再看看朋友的新发现"}</h2>
          </div>
          <span className="collector-ritual__count">
            <Ticket size={17} aria-hidden="true" />
            {completedInteractions}/{communityEvents.length}
          </span>
        </div>
        <div className="collector-ritual__steps">
          {communityEvents.map((event, index) => {
            const completed = interactedActivityIds.includes(event.id);
            return (
              <span key={event.id} className={completed ? "is-complete" : ""}>
                {completed ? <Check size={15} /> : <Circle size={15} />}
                {index === 0 ? "祝贺里程碑" : index === 1 ? "欣赏新成就" : "回应新展柜"}
              </span>
            );
          })}
        </div>
        <div className="collector-ritual__bar" aria-hidden="true">
          <span style={{ width: `${(completedInteractions / communityEvents.length) * 100}%` }} />
        </div>
      </section>

      <section className="content-section community-feed" aria-labelledby="community-feed-title">
        <div className="section-heading section-heading--inline">
          <div>
            <p className="eyebrow">朋友的新动态</p>
            <h2 id="community-feed-title">今天，收藏圈里发生了这些事</h2>
          </div>
          <UsersRound size={22} aria-hidden="true" />
        </div>
        <div className="community-event-list">
          {communityEvents.map((event) => (
            <CommunityEventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="community-weekly" aria-label="本周共赏主题">
        <div className="community-weekly__copy">
          <p className="eyebrow">本周共赏</p>
          <h2>水晶动物正在被看见</h2>
          <p>朋友中已有 2 人完成图鉴。看看你的展柜还缺少哪一种造型。</p>
          <ButtonLink to={routes.collection} variant="secondary">
            <Compass size={17} /> 查看我的图鉴
          </ButtonLink>
        </div>
        <div className="community-weekly__toys" aria-hidden="true">
          {mockToys.slice(0, 3).map((toy) => (
            <ToyThumbnail key={toy.id} toy={toy} size="small" />
          ))}
        </div>
      </section>
    </div>
  );
}
