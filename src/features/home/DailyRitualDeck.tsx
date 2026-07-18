import {
  BookOpenCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Ticket,
  WandSparkles,
  type LucideIcon
} from "lucide-react";
import {
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routes";

type RitualTask = {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
  icon: LucideIcon;
  action: "feed" | "draw" | "collection" | "share";
};

export const ritualTasks: RitualTask[] = [
  {
    id: "ritual_like",
    title: "给好友的新玩偶点个赞",
    detail: "让朋友知道，这份刚刚抽到的惊喜也被你看见了。",
    actionLabel: "去回应",
    icon: Heart,
    action: "feed"
  },
  {
    id: "ritual_draw",
    title: "完成一次今日抽取",
    detail: "新成员也许正在这一期的收藏池里等你。",
    actionLabel: "去抽取",
    icon: WandSparkles,
    action: "draw"
  },
  {
    id: "ritual_collection",
    title: "翻看一套收藏图鉴",
    detail: "看看哪一只还没有进入你的系列展柜。",
    actionLabel: "看图鉴",
    icon: BookOpenCheck,
    action: "collection"
  },
  {
    id: "ritual_comment",
    title: "留下一句收藏感想",
    detail: "一句简单的喜欢，也能让收藏圈更有温度。",
    actionLabel: "去留言",
    icon: MessageCircle,
    action: "feed"
  },
  {
    id: "ritual_share",
    title: "分享今天的代表藏品",
    detail: "把最喜欢的一只，放进朋友今天的收藏记忆里。",
    actionLabel: "去分享",
    icon: Share2,
    action: "share"
  }
];

type DailyRitualDeckProps = {
  completedTaskIds: string[];
  onComplete: (taskId: string) => void;
};

export function DailyRitualDeck({ completedTaskIds, onComplete }: DailyRitualDeckProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [pointerStartX, setPointerStartX] = useState<number | null>(null);
  const activeTask = ritualTasks[activeIndex];
  const completedCount = ritualTasks.filter((task) => completedTaskIds.includes(task.id)).length;
  const completed = completedTaskIds.includes(activeTask.id);
  const TaskIcon = activeTask.icon;

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + ritualTasks.length) % ritualTasks.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % ritualTasks.length);
  };

  const handleAction = async () => {
    if (!completed) onComplete(activeTask.id);

    if (activeTask.action === "feed") {
      window.setTimeout(() => {
        document.querySelector("#friend-collecting-feed")?.scrollIntoView({ behavior: "smooth" });
      }, 80);
      return;
    }
    if (activeTask.action === "draw") {
      navigate(routes.draw);
      return;
    }
    if (activeTask.action === "collection") {
      navigate(routes.collection);
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Let's Collect",
          text: "来看看我今天的代表藏品。",
          url: window.location.href
        });
      } catch {
        // Closing the native share sheet should not interrupt the ritual flow.
      }
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    setPointerStartX(null);
    if (Math.abs(distance) < 34) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  return (
    <section className="ritual-deck" aria-labelledby="ritual-deck-title">
      <div className="ritual-deck__heading">
        <div>
          <p className="eyebrow">今日收藏仪式</p>
          <h2 id="ritual-deck-title">每天，完成几件收藏小事</h2>
        </div>
        <span><Ticket size={17} /> {completedCount}/{ritualTasks.length}</span>
      </div>

      <div
        className="ritual-deck__stack"
        onPointerDown={(event) => setPointerStartX(event.clientX)}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setPointerStartX(null)}
      >
        <article className={completed ? "ritual-card is-complete" : "ritual-card"} key={activeTask.id}>
          <div className="ritual-card__topline">
            <span>收藏小事 {String(activeIndex + 1).padStart(2, "0")}</span>
            <strong>{completed ? <><Check size={14} /> 已完成</> : "+1 抽取券"}</strong>
          </div>
          <div className="ritual-card__body">
            <span className="ritual-card__icon" aria-hidden="true"><TaskIcon size={23} /></span>
            <div>
              <h3>{activeTask.title}</h3>
              <p>{activeTask.detail}</p>
            </div>
          </div>
          <button type="button" className="ritual-card__action" onClick={handleAction}>
            {completed ? <Check size={16} /> : <Sparkles size={16} />}
            {completed ? "再去看看" : activeTask.actionLabel}
          </button>
        </article>
      </div>

      <div className="ritual-deck__controls">
        <button type="button" onClick={showPrevious} aria-label="上一件收藏小事" title="上一张">
          <ChevronLeft size={18} />
        </button>
        <div aria-label="选择收藏小事">
          {ritualTasks.map((task, index) => (
            <button
              key={task.id}
              type="button"
              className={`${index === activeIndex ? "is-active" : ""}${completedTaskIds.includes(task.id) ? " is-complete" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={task.title}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
        <button type="button" onClick={showNext} aria-label="下一件收藏小事" title="下一张">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
