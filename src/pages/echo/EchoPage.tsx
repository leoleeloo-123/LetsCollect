import {
  ArrowRight,
  CircleCheck,
  Gift,
  Leaf,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Waves,
  Wind
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DRAW_COST, useMvpState } from "../../app/MvpState";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { getToyModel, getToyPalette } from "../../features/toys/catalog";
import { getCollectibleMaterialLabel } from "../../features/toys/presentation";
import { echoService } from "../../services/echo";
import type {
  DailyEchoCollection,
  EchoCandidate,
  ResonanceContext
} from "../../types/echo";
import "./echo-page.css";

type PageStatus = "loading" | "ready" | "error";
type ActionKind = "leave" | "drift" | "progress" | null;

function RepresentativeCompanions({
  candidate
}: {
  candidate: EchoCandidate;
}) {
  return (
    <div
      className="echo-representatives"
      aria-label={`${candidate.anonymousName}'s Representative Companions`}
    >
      {candidate.representativeCompanions.map((toy) => {
        const model = getToyModel(toy.modelId);
        const palette = getToyPalette(toy.paletteId);

        return (
          <article className="echo-representative" key={toy.id}>
            <div className="echo-representative__visual">
              <ToyThumbnail toy={toy} size="small" />
            </div>
            <div className="echo-representative__copy">
              <strong>{model.name}</strong>
              <span>{palette.name}</span>
              <small>{getCollectibleMaterialLabel(toy)}</small>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function EchoPage() {
  const {
    collection,
    favoriteIds,
    representativeIds,
    tastePreferences,
    interactAndEarn
  } = useMvpState();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [day, setDay] = useState<DailyEchoCollection | null>(null);
  const [action, setAction] = useState<ActionKind>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const resonanceContext = useMemo<ResonanceContext>(() => ({
    collection,
    favoriteIds,
    representativeIds,
    tastePreferences
  }), [
    collection,
    favoriteIds,
    representativeIds,
    tastePreferences
  ]);

  const loadDay = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const nextDay = await echoService.getDailyEchoes(resonanceContext);
      setDay(nextDay);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("Today’s Echoes could not be gathered. Your collection is still safe.");
    }
  }, [resonanceContext]);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setError("");

    echoService
      .getDailyEchoes(resonanceContext)
      .then((nextDay) => {
        if (!active) return;
        setDay(nextDay);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
        setError("Today’s Echoes could not be gathered. Your collection is still safe.");
      });

    return () => {
      active = false;
    };
  }, [resonanceContext]);

  const activeCandidate = useMemo(
    () => day?.candidates.find((candidate) => candidate.decision === "pending") ?? null,
    [day]
  );
  const activeOrdinal = activeCandidate && day
    ? day.candidates.findIndex((candidate) => candidate.id === activeCandidate.id) + 1
    : 0;

  async function handleDecision(kind: "leave" | "drift") {
    if (!activeCandidate || action) return;
    setAction(kind);
    setError("");

    try {
      const result = kind === "leave"
        ? await echoService.leaveEcho(activeCandidate.id, resonanceContext)
        : await echoService.letDrift(activeCandidate.id, resonanceContext);
      setDay(result.day);
      setNotice(
        result.decision === "mutual"
          ? "The Echo came back. A small Collect Together path has opened."
          : result.decision === "left"
            ? "Your Echo was left gently. Nothing else is required."
            : "This collecting path has been allowed to drift."
      );
    } catch {
      setError("That Echo could not be saved. Please try once more.");
    } finally {
      setAction(null);
    }
  }

  async function handleTaskProgress() {
    const task = day?.collectTogetherTask;
    if (!task || task.status === "completed" || action) return;
    setAction("progress");
    setError("");

    try {
      const nextDay = await echoService.advanceCollectTogether(
        task.id,
        resonanceContext
      );
      const completedNow =
        nextDay.collectTogetherTask?.status === "completed";
      if (completedNow) {
        interactAndEarn(`echo-reward:${task.id}`, DRAW_COST);
      }
      setDay(nextDay);
      setNotice(
        completedNow
          ? "The shared moment is complete. One extra Companion encounter is ready."
          : "Your small contribution has been remembered."
      );
    } catch {
      setError("This shared step could not be saved. Please try again.");
    } finally {
      setAction(null);
    }
  }

  return (
    <div className="page-stack echo-page" aria-labelledby="echo-page-title">
      <header className="echo-page__header">
        <div>
          <p className="echo-page__eyebrow"><Waves size={15} /> ECHO</p>
          <h1 id="echo-page-title">A similar collecting path crossed yours.</h1>
          <p>
            A few quiet signals, found through the Companions you choose.
            No chat. No pressure. Just a small shared resonance.
          </p>
        </div>
        <div className="echo-page__daily-note">
          <Leaf size={17} aria-hidden="true" />
          <span>Up to three quiet crossings each day</span>
        </div>
      </header>

      {notice ? (
        <p className="echo-page__notice" role="status">
          <Sparkles size={16} aria-hidden="true" />
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="echo-page__error" role="alert">{error}</p>
      ) : null}

      {status === "loading" ? (
        <section className="echo-page__state" role="status">
          <LoaderCircle className="echo-page__spinner" size={25} />
          <strong>Listening for a quiet resonance…</strong>
          <span>Only collection signals are being considered.</span>
        </section>
      ) : null}

      {status === "error" ? (
        <section className="echo-page__state">
          <Wind size={27} aria-hidden="true" />
          <strong>The path is quiet for a moment.</strong>
          <span>Try gathering today’s Echoes again.</span>
          <button type="button" onClick={loadDay}>
            <RefreshCw size={16} /> Try again
          </button>
        </section>
      ) : null}

      {status === "ready" && day ? (
        <>
          <div
            className={`echo-page__layout${day.collectTogetherTask ? " echo-page__layout--with-task" : ""}`}
          >
            <section className="echo-page__crossing" aria-live="polite">
              <div className="echo-page__progress">
                <span>
                  {day.remaining > 0
                    ? `${day.remaining} quiet ${day.remaining === 1 ? "crossing" : "crossings"} remain today`
                    : "Today’s crossings are complete"}
                </span>
                <div
                  className="echo-page__progress-dots"
                  aria-label={`${day.dailyLimit - day.remaining} of ${day.dailyLimit} Echoes considered`}
                >
                  {day.candidates.map((candidate) => (
                    <span
                      key={candidate.id}
                      className={candidate.decision === "pending" ? "" : "is-complete"}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              {activeCandidate ? (
                <article className="echo-card" key={activeCandidate.id}>
                  <header className="echo-card__header">
                    <div>
                      <span>Quiet crossing {activeOrdinal} of {day.dailyLimit}</span>
                      <h2>{activeCandidate.anonymousName}</h2>
                    </div>
                    <span className="echo-card__anonymous">
                      <Leaf size={14} aria-hidden="true" /> Anonymous collector
                    </span>
                  </header>

                  <RepresentativeCompanions candidate={activeCandidate} />

                  <section
                    className="echo-card__reason"
                    aria-labelledby={`echo-reason-${activeCandidate.id}`}
                  >
                    <p>Why this path crossed yours</p>
                    <h3 id={`echo-reason-${activeCandidate.id}`}>
                      {activeCandidate.resonance.primaryReason}
                    </h3>
                    {activeCandidate.resonance.secondaryReason ? (
                      <p>{activeCandidate.resonance.secondaryReason}</p>
                    ) : null}
                  </section>

                  <ul className="echo-card__signals" aria-label="Shared collection signals">
                    {activeCandidate.resonance.sharedSignals.map((signal) => (
                      <li key={signal.id}>
                        <span aria-hidden="true"><Sparkles size={14} /></span>
                        <div>
                          <strong>{signal.summary}</strong>
                          <p>{signal.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="echo-card__actions">
                    <button
                      className="echo-card__primary-action"
                      type="button"
                      disabled={action !== null}
                      onClick={() => handleDecision("leave")}
                    >
                      {action === "leave"
                        ? <LoaderCircle className="echo-page__spinner" size={17} />
                        : <Waves size={17} />}
                      Leave an Echo
                    </button>
                    <button
                      className="echo-card__secondary-action"
                      type="button"
                      disabled={action !== null}
                      onClick={() => handleDecision("drift")}
                    >
                      {action === "drift"
                        ? <LoaderCircle className="echo-page__spinner" size={17} />
                        : <Wind size={17} />}
                      Let it drift
                    </button>
                  </div>
                </article>
              ) : (
                <div className="echo-page__complete">
                  <span><Wind size={25} aria-hidden="true" /></span>
                  <h2>Today’s Echoes have drifted softly.</h2>
                  <p>
                    There is nothing to keep up with. New collecting paths may
                    cross yours another day.
                  </p>
                  <Link to="/">
                    Return to Collect <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </section>

            {day.collectTogetherTask ? (
              <aside className="collect-together" aria-labelledby="collect-together-title">
                <p className="collect-together__eyebrow">
                  <Sparkles size={14} aria-hidden="true" /> COLLECT TOGETHER
                </p>
                <h2 id="collect-together-title">{day.collectTogetherTask.title}</h2>
                <p>{day.collectTogetherTask.description}</p>

                <div className="collect-together__bar-copy">
                  <span>Shared progress</span>
                  <strong>
                    {day.collectTogetherTask.progress}
                    <small> / {day.collectTogetherTask.targetCount}</small>
                  </strong>
                </div>
                <div
                  className="collect-together__bar"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={day.collectTogetherTask.targetCount}
                  aria-valuenow={day.collectTogetherTask.progress}
                  aria-label="Collect Together progress"
                >
                  <span
                    style={{
                      width: `${day.collectTogetherTask.progress
                        / day.collectTogetherTask.targetCount * 100}%`
                    }}
                  />
                </div>

                <div className="collect-together__reward">
                  <Gift size={17} aria-hidden="true" />
                  <div>
                    <span>Shared reward</span>
                    <strong>{day.collectTogetherTask.rewardLabel}</strong>
                  </div>
                </div>

                {day.collectTogetherTask.status === "completed" ? (
                  <p className="collect-together__complete" role="status">
                    <CircleCheck size={17} aria-hidden="true" />
                    A small shared moment, complete.
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={action !== null}
                    onClick={handleTaskProgress}
                  >
                    {action === "progress"
                      ? <LoaderCircle className="echo-page__spinner" size={16} />
                      : <Sparkles size={16} />}
                    Add my small contribution
                  </button>
                )}
              </aside>
            ) : null}
          </div>

          <p className="echo-page__privacy-note">
            Echo uses Companion, color, material, and collecting-path signals
            only. It does not reveal personal profiles or create a conversation.
          </p>
        </>
      ) : null}
    </div>
  );
}
