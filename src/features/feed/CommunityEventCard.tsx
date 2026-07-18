import {
  Award,
  Bookmark,
  BookOpenCheck,
  Heart,
  MessageCircle,
  Send,
  Sparkles,
  Star
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import {
  communityToyById,
  type CommunityEvent,
  type CommunityEventKind
} from "../../data/mock/community";

type CommunityEventCardProps = {
  event: CommunityEvent;
  onRitualComplete?: (taskId: string) => void;
};

const eventIcons: Record<CommunityEventKind, typeof Sparkles> = {
  draw_revealed: Sparkles,
  set_completed: BookOpenCheck,
  achievement_unlocked: Award,
  showcase_updated: Star
};

const recentComments: Record<string, string> = {
  activity_001: "小满：最后一只终于到齐了！",
  activity_002: "Luna：八种材质放在一起一定很好看。",
  activity_003: "Mia：这只很适合做代表藏品。"
};

export function CommunityEventCard({ event, onRitualComplete }: CommunityEventCardProps) {
  const toy = communityToyById.get(event.toyId);
  const [liked, setLiked] = useState(false);
  const [wished, setWished] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [ownComment, setOwnComment] = useState("");
  const EventIcon = eventIcons[event.kind];

  if (!toy) return null;

  const handleLike = () => {
    setLiked((current) => !current);
    if (!liked) onRitualComplete?.("ritual_like");
  };

  const handleComment = (eventSubmit: FormEvent<HTMLFormElement>) => {
    eventSubmit.preventDefault();
    const comment = draft.trim();
    if (!comment) return;
    setOwnComment(comment);
    setDraft("");
    setCommentOpen(false);
    onRitualComplete?.("ritual_comment");
  };

  return (
    <article className={`community-event community-event--${event.kind}`}>
      <header className="community-event__header">
        <span className="community-event__avatar" aria-hidden="true">{event.userInitial}</span>
        <div>
          <strong>{event.userName}</strong>
          <span>{event.timeLabel}</span>
        </div>
        <span className="community-event__type"><EventIcon size={13} /> {event.eventLabel}</span>
      </header>

      <div className="community-event__body">
        <div className="community-event__visual"><ToyThumbnail toy={toy} size="small" /></div>
        <div className="community-event__copy">
          <h3>{event.action}</h3>
          <p>{event.detail}</p>
          <span>{toy.name} · {toy.seriesName}</span>
        </div>
      </div>

      <div className="community-event__actions" aria-label="收藏互动">
        <button type="button" className={liked ? "is-active" : ""} onClick={handleLike}>
          <Heart size={15} fill={liked ? "currentColor" : "none"} />
          赞 {event.reactionCount + (liked ? 1 : 0)}
        </button>
        <button type="button" className={commentOpen ? "is-active" : ""} onClick={() => setCommentOpen((open) => !open)}>
          <MessageCircle size={15} /> 留言
        </button>
        <button type="button" className={wished ? "is-active" : ""} onClick={() => setWished((current) => !current)}>
          <Bookmark size={15} fill={wished ? "currentColor" : "none"} /> {wished ? "已加入" : "心愿"}
        </button>
        <button type="button" className={reacted ? "is-active" : ""} onClick={() => setReacted((current) => !current)}>
          <Sparkles size={15} /> {event.reactionLabel}
        </button>
      </div>

      <div className="community-event__comments">
        <p>{recentComments[event.id]}</p>
        {ownComment ? <p><strong>我：</strong>{ownComment}</p> : null}
        {commentOpen ? (
          <form onSubmit={handleComment}>
            <input
              value={draft}
              onChange={(inputEvent) => setDraft(inputEvent.target.value)}
              placeholder="留一句收藏感想"
              aria-label="留言内容"
              autoFocus
            />
            <button type="submit" aria-label="发送留言" title="发送"><Send size={15} /></button>
          </form>
        ) : null}
      </div>
    </article>
  );
}
