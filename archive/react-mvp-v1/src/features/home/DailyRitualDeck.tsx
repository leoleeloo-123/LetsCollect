import {
  BookOpenCheck,
  Check,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  WandSparkles,
  type LucideIcon
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
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

type DragSession = {
  pointerId: number;
  startX: number;
  startTime: number;
};

type SlideDirection = -1 | 0 | 1;

const TRANSITION_DURATION = 300;

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
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(0);
  const dragSessionRef = useRef<DragSession | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const activeTask = ritualTasks[activeIndex];

  useEffect(() => () => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
  }, []);

  const moveTo = (nextIndex: number, direction: Exclude<SlideDirection, 0>) => {
    if (nextIndex === activeIndex) return;
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    setPreviousIndex(activeIndex);
    setSlideDirection(direction);
    setActiveIndex(nextIndex);
    transitionTimerRef.current = window.setTimeout(() => {
      setPreviousIndex(null);
      setSlideDirection(0);
      transitionTimerRef.current = null;
    }, TRANSITION_DURATION);
  };

  const moveBy = (direction: Exclude<SlideDirection, 0>) => {
    const nextIndex = (activeIndex + direction + ritualTasks.length) % ritualTasks.length;
    moveTo(nextIndex, direction);
  };

  const handleAction = async () => {
    if (!completedTaskIds.includes(activeTask.id)) onComplete(activeTask.id);

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

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startTime: performance.now()
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const finishPointerGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const distance = event.clientX - session.startX;
    const elapsed = Math.max(performance.now() - session.startTime, 1);
    const velocity = distance / elapsed;
    dragSessionRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (Math.abs(distance) > 42 || (Math.abs(distance) > 20 && Math.abs(velocity) > 0.45)) {
      moveBy(distance < 0 ? 1 : -1);
    }
  };

  const cancelPointerGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragSessionRef.current?.pointerId !== event.pointerId) return;
    dragSessionRef.current = null;
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveBy(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(1);
    }
  };

  const renderPanel = (task: RitualTask, isCurrent: boolean) => {
    const TaskIcon = task.icon;
    const completed = completedTaskIds.includes(task.id);
    return (
      <>
        <span className="ritual-strip__icon" aria-hidden="true"><TaskIcon size={20} /></span>
        <div className="ritual-strip__copy">
          <h3>{task.title}</h3>
          <p>{task.detail}</p>
        </div>
        <button
          type="button"
          className="ritual-strip__action"
          onClick={isCurrent ? handleAction : undefined}
          tabIndex={isCurrent ? 0 : -1}
        >
          {completed ? <Check size={14} /> : <Sparkles size={14} />}
          {completed ? "再去看看" : task.actionLabel}
        </button>
      </>
    );
  };

  const previousTask = previousIndex === null ? null : ritualTasks[previousIndex];

  return (
    <section className="ritual-strip" aria-label="今日收藏任务">
      <div className="ritual-strip__topline">
        <span>收藏小事 {String(activeIndex + 1).padStart(2, "0")}</span>
        <div className="ritual-strip__progress" aria-label="选择收藏小事">
          {ritualTasks.map((task, index) => (
            <button
              key={task.id}
              type="button"
              className={`${index === activeIndex ? "is-active" : ""}${completedTaskIds.includes(task.id) ? " is-complete" : ""}`}
              aria-label={task.title}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => moveTo(index, index > activeIndex ? 1 : -1)}
            />
          ))}
        </div>
        <strong>+1 抽取券</strong>
      </div>

      <div
        className="ritual-strip__viewport"
        role="group"
        aria-live="polite"
        aria-label={`第 ${activeIndex + 1} 张，共 ${ritualTasks.length} 张。左右滑动切换。`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={finishPointerGesture}
        onPointerCancel={cancelPointerGesture}
      >
        {previousTask ? (
          <article
            className={`ritual-strip__panel is-previous ${slideDirection === 1 ? "is-leaving-next" : "is-leaving-previous"}`}
            aria-hidden="true"
          >
            {renderPanel(previousTask, false)}
          </article>
        ) : null}
        <article
          key={activeTask.id}
          className={`ritual-strip__panel is-current ${slideDirection === 1 ? "is-entering-next" : slideDirection === -1 ? "is-entering-previous" : ""}`}
        >
          {renderPanel(activeTask, true)}
        </article>
      </div>
    </section>
  );
}
