import { Heart, TicketCheck } from "lucide-react";
import { useMvpState } from "../../app/MvpState";
import { toyById } from "../../data/mock/toys";
import type { SocialActivity } from "../../types/toy";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";

type ActivityCardProps = {
  activity: SocialActivity;
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const { interactedActivityIds, interactAndEarn } = useMvpState();
  const toy = toyById.get(activity.toyId);
  const claimed = interactedActivityIds.includes(activity.id);

  if (!toy) return null;

  return (
    <article className="activity-card">
      <div className="activity-card__avatar" aria-hidden="true">
        {activity.userInitial}
      </div>
      <div className="activity-card__content">
        <div className="activity-card__meta">
          <p>
            <strong>{activity.userName}</strong> {activity.action}
          </p>
          <span>{activity.timeLabel}</span>
        </div>
        <div className="activity-card__toy">
          <ToyThumbnail toy={toy} size="small" />
          <div>
            <strong>{toy.name}</strong>
            <span>{toy.seriesName}</span>
          </div>
        </div>
        <button
          className={`reward-button${claimed ? " reward-button--claimed" : ""}`}
          type="button"
          disabled={claimed}
          onClick={() => interactAndEarn(activity.id, activity.reward)}
        >
          {claimed ? <TicketCheck size={17} /> : <Heart size={17} />}
          {claimed ? "已互动，奖励已领取" : `送上喜欢 · +${activity.reward} 券`}
        </button>
      </div>
    </article>
  );
}
