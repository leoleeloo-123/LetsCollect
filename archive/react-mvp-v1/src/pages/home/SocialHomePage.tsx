import { UsersRound } from "lucide-react";
import { useMvpState } from "../../app/MvpState";
import { communityEvents } from "../../data/mock/community";
import { CommunityEventCard } from "../../features/feed/CommunityEventCard";
import { CollectibleSeriesStage } from "../../features/home/CollectibleSeriesStage";
import { DailyRitualDeck } from "../../features/home/DailyRitualDeck";

export function SocialHomePage() {
  const { interactedActivityIds, interactAndEarn } = useMvpState();

  const completeRitual = (taskId: string) => {
    interactAndEarn(taskId, 1);
  };

  return (
    <div className="page-stack social-home-page">
      <CollectibleSeriesStage />

      <DailyRitualDeck
        completedTaskIds={interactedActivityIds}
        onComplete={completeRitual}
      />

      <section
        className="content-section community-feed"
        id="friend-collecting-feed"
        aria-labelledby="community-feed-title"
      >
        <div className="section-heading section-heading--inline">
          <div>
            <p className="eyebrow">好友收藏动态</p>
            <h2 id="community-feed-title">朋友刚刚收藏了这些</h2>
          </div>
          <UsersRound size={21} aria-hidden="true" />
        </div>
        <div className="community-event-list">
          {communityEvents.map((event) => (
            <CommunityEventCard
              key={event.id}
              event={event}
              onRitualComplete={completeRitual}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
