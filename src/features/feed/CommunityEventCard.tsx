import {
  Award,
  BookOpenCheck,
  Heart,
  Sparkles,
  Star,
  TicketCheck
} from "lucide-react";
import { useMvpState } from "../../app/MvpState";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import {
  communityToyById,
  type CommunityEvent,
  type CommunityEventKind
} from "../../data/mock/community";

type CommunityEventCardProps = {
  event: CommunityEvent;
};

const eventIcons: Record<CommunityEventKind, typeof Sparkles> = {
  draw_revealed: Sparkles,
  set_completed: BookOpenCheck,
  achievement_unlocked: Award,
  showcase_updated: Star
};

export function CommunityEventCard({ event }: CommunityEventCardProps) {
  const { interactedActivityIds, interactAndEarn } = useMvpState();
  const toy = communityToyById.get(event.toyId);
  const claimed = interactedActivityIds.includes(event.id);
  const EventIcon = eventIcons[event.kind];

  if (!toy) return null;

  return (
    <article className={`community-event community-event--${event.kind}`}>
      <header className="community-event__header">
        <span className="community-event__avatar" aria-hidden="true">
          {event.userInitial}
        </span>
        <div>
          <strong>{event.userName}</strong>
          <span>{event.timeLabel}</span>
        </div>
        <span className="community-event__type">
          <EventIcon size={14} aria-hidden="true" />
          {event.eventLabel}
        </span>
      </header>

      <div className="community-event__body">
        <div className="community-event__visual">
          <ToyThumbnail toy={toy} size="small" />
        </div>
        <div className="community-event__copy">
          <h3>{event.action}</h3>
          <p>{event.detail}</p>
          <span>{toy.name} · {toy.seriesName}</span>
        </div>
      </div>

      <footer className="community-event__footer">
        <span><Heart size={14} aria-hidden="true" /> {event.reactionCount + (claimed ? 1 : 0)}</span>
        <button
          type="button"
          className={claimed ? "community-reaction is-claimed" : "community-reaction"}
          disabled={claimed}
          onClick={() => interactAndEarn(event.id, event.reward)}
        >
          {claimed ? <TicketCheck size={16} /> : <Sparkles size={16} />}
          {claimed ? `已送出${event.reactionLabel}` : `${event.reactionLabel} · +${event.reward} 券`}
        </button>
      </footer>
    </article>
  );
}
