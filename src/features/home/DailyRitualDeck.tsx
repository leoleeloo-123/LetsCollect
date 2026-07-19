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
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routes";
import "./daily-ritual-stack.css";

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

type CardDirection = -1 | 0 | 1;

const EXIT_DURATION = 260;

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
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<CardDirection>(0);
  const dragSessionRef = useRef<DragSession | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const activeTask = ritualTasks[activeIndex];
  const completed = completedTaskIds.includes(activeTask.id);

  useEffect(() => () => {
    if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
  }, []);

  const moveDeck = (direction: Exclude<CardDirection, 0>) => {
    if (exitDirection !== 0) return;
    setExitDirection(direction);
    setIsDragging(false);
    exitTimerRef.current = window.setTimeout(() => {
      setActiveIndex((current) => (
        current + direction + ritualTasks.length
      ) % ritualTasks.length);
      setDragX(0);
      setExitDirection(0);
      exitTimerRef.current = null;
    }, EXIT_DURATION);
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

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (exitDirection !== 0 || (event.target as HTMLElement).closest("button")) return;
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startTime: performance.now()
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const distance = event.clientX - session.startX;
    const resistedDistance = Math.sign(distance) * Math.min(Math.abs(distance), 150);
    setDragX(resistedDistance);
  };

  const finishPointerGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const distance = event.clientX - session.startX;
    const elapsed = Math.max(performance.now() - session.startTime, 1);
    const velocity = distance / elapsed;
    dragSessionRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const shouldMove = Math.abs(distance) > 52
      || (Math.abs(distance) > 20 && Math.abs(velocity) > 0.5);
    if (shouldMove) moveDeck(distance < 0 ? 1 : -1);
    else setDragX(0);
  };

  const cancelPointerGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragSessionRef.current?.pointerId !== event.pointerId) return;
    dragSessionRef.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveDeck(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveDeck(1);
    }
  };

  const topCardStyle = {
    "--ritual-drag-x": `${dragX}px`,
    "--ritual-drag-rotate": `${dragX * 0.035}deg`
  } as CSSProperties;

  return (
    <section className="ritual-deck ritual-deck--stack" aria-label="今日收藏任务">
      <div
        className="ritual-card-stack"
        role="group"
        aria-roledescription="任务卡片堆"
        aria-label={`第 ${activeIndex + 1} 张，共 ${ritualTasks.length} 张。左右拖动翻阅。`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerGesture}
        onPointerCancel={cancelPointerGesture}
      >
        {[2, 1, 0].map((depth) => {
          const taskIndex = (activeIndex + depth) % ritualTasks.length;
          const task = ritualTasks[taskIndex];
          const TaskIcon = task.icon;
          const taskCompleted = completedTaskIds.includes(task.id);
          const topCardClassName = [
            "ritual-stack-card",
            taskCompleted ? "is-complete" : "",
            depth === 0 ? "is-top" : "",
            depth === 0 && isDragging ? "is-dragging" : "",
            depth === 0 && exitDirection === -1 ? "is-exiting-left" : "",
            depth === 0 && exitDirection === 1 ? "is-exiting-right" : ""
          ].filter(Boolean).join(" ");

          return (
            <article
              key={`${task.id}-${depth}`}
              className={topCardClassName}
              data-depth={depth}
              aria-hidden={depth > 0 ? "true" : undefined}
              style={depth === 0 ? topCardStyle : undefined}
            >
              {depth === 0 ? (
                <>
                  <div className="ritual-stack-card__topline">
                    <span>收藏小事 {String(activeIndex + 1).padStart(2, "0")}</span>
                    <strong>{completed ? <><Check size={13} /> 已完成</> : "+1 抽取券"}</strong>
                  </div>
                  <div className="ritual-stack-card__body">
                    <span className="ritual-stack-card__icon" aria-hidden="true"><TaskIcon size={21} /></span>
                    <div className="ritual-stack-card__copy">
                      <h3>{activeTask.title}</h3>
                      <p>{activeTask.detail}</p>
                    </div>
                    <button type="button" className="ritual-stack-card__action" onClick={handleAction}>
                      {completed ? <Check size={15} /> : <Sparkles size={15} />}
                      {completed ? "再去看看" : activeTask.actionLabel}
                    </button>
                  </div>
                </>
              ) : (
                <div className="ritual-stack-card__peek">
                  <span>接下来</span>
                  <strong>{task.title}</strong>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="ritual-deck__footer">
        <span>左右滑动翻阅</span>
        <div className="ritual-deck__progress" aria-hidden="true">
          {ritualTasks.map((task, index) => (
            <span
              key={task.id}
              className={`${index === activeIndex ? "is-active" : ""}${completedTaskIds.includes(task.id) ? " is-complete" : ""}`}
            />
          ))}
        </div>
        <strong>{String(activeIndex + 1).padStart(2, "0")}/{String(ritualTasks.length).padStart(2, "0")}</strong>
      </div>
    </section>
  );
}
