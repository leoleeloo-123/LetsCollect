import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Check,
  CircleGauge,
  ClipboardCheck,
  Eye,
  LockKeyhole,
  Minus,
  Route,
  Sparkles,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCurrentAsset } from "../../config/capabilityRegistry";
import {
  agentConsoleCopy,
  evolutionStageCopy,
  feasibilityCopy
} from "../../content/agentCopy";
import {
  approveCampaignProposal,
  createEvolutionConsoleSnapshot,
  recordProposalViewed
} from "../../services/evolution";
import type {
  CampaignProposal,
  CommunitySignal,
  EvolutionConsoleSnapshot
} from "../../types/agent";
import "./agent-console.css";

const stageIcons = {
  observe: Eye,
  reason: BrainCircuit,
  propose: Sparkles,
  approve: ClipboardCheck,
  measure: CircleGauge
} as const;

function getSignalIcon(signal: CommunitySignal) {
  if (signal.trend === "up") return TrendingUp;
  if (signal.trend === "down") return TrendingDown;
  return Minus;
}

function humanizeId(value: string) {
  return value
    .split(/[-_]/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function ProposalCard({
  proposal,
  busy,
  onApprove
}: {
  proposal: CampaignProposal;
  busy: boolean;
  onApprove: (proposalId: string) => Promise<void>;
}) {
  const feasibility = feasibilityCopy[proposal.feasibility.status];
  const isApproved = proposal.status === "approved";
  const actionDisabled = busy || isApproved || !proposal.feasibility.canApprove;
  const actionLabel = isApproved
    ? agentConsoleCopy.approved
    : proposal.feasibility.canApprove
      ? agentConsoleCopy.approve
      : "Publish unavailable · needs assets";

  return (
    <article
      className={`agent-proposal agent-proposal--${proposal.feasibility.status}`}
      aria-labelledby={`${proposal.id}-title`}
    >
      <header className="agent-proposal__header">
        <div>
          <p className="agent-console__kicker">
            {proposal.roadmapLabel ?? "Current asset proposal"}
          </p>
          <h3 id={`${proposal.id}-title`}>{proposal.title}</h3>
        </div>
        <span className={`agent-status agent-status--${proposal.feasibility.status}`}>
          {feasibility.label}
        </span>
      </header>

      <p className="agent-proposal__insight">{proposal.insight}</p>

      <dl className="agent-proposal__facts">
        <div>
          <dt>Audience</dt>
          <dd>{proposal.targetAudience}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{proposal.durationDays} days</dd>
        </div>
        <div>
          <dt>Current assets</dt>
          <dd>
            {proposal.eligibleAssetIds.length > 0
              ? proposal.eligibleAssetIds
                .map((id) => getCurrentAsset(id)?.name ?? humanizeId(id))
                .join(", ")
              : "No eligible current assets"}
          </dd>
        </div>
        <div>
          <dt>Colors</dt>
          <dd>
            {proposal.featuredColorIds.length > 0
              ? proposal.featuredColorIds.map(humanizeId).join(", ")
              : "Requires a future palette decision"}
          </dd>
        </div>
      </dl>

      <div className="agent-proposal__task">
        <Route size={17} aria-hidden="true" />
        <div>
          <span>Collect Together</span>
          <strong>{proposal.sharedTask.label}</strong>
          <small>Reward · {proposal.reward.label}</small>
        </div>
      </div>

      <details className="agent-proposal__details">
        <summary>Configuration and feasibility</summary>
        <div className="agent-proposal__detail-body">
          <ul className="agent-change-list">
            {proposal.configurationChanges.map((change) => (
              <li key={`${proposal.id}-${change.key}-${change.target}`}>
                <span>{humanizeId(change.key)}</span>
                <strong>{change.target}: {String(change.value)}</strong>
                <small>{change.explanation}</small>
              </li>
            ))}
          </ul>
          <ul className="agent-reason-list" aria-label="Feasibility reasons">
            {proposal.feasibility.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      </details>

      <footer className="agent-proposal__footer">
        <div>
          <strong>{feasibility.description}</strong>
          <span>
            {proposal.feasibility.canPublish
              ? "Publishing still requires the normal human release step."
              : proposal.feasibility.canApprove
                ? agentConsoleCopy.approvalNote
                : agentConsoleCopy.roadmapNote}
          </span>
        </div>
        <button
          type="button"
          disabled={actionDisabled}
          onClick={() => onApprove(proposal.id)}
          aria-describedby={`${proposal.id}-action-note`}
        >
          {isApproved ? <Check size={17} aria-hidden="true" /> : <LockKeyhole size={17} aria-hidden="true" />}
          {busy ? "Recording…" : actionLabel}
        </button>
        <span className="agent-proposal__sr-note" id={`${proposal.id}-action-note`}>
          {feasibility.description}
        </span>
      </footer>
    </article>
  );
}

export function AgentConsolePage() {
  const [snapshot, setSnapshot] = useState<EvolutionConsoleSnapshot>(
    createEvolutionConsoleSnapshot
  );
  const [busyProposalId, setBusyProposalId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const initialProposals = useRef(snapshot.proposals);

  useEffect(() => {
    void Promise.all(initialProposals.current.map(recordProposalViewed));
  }, []);

  async function handleApprove(proposalId: string) {
    const proposal = snapshot.proposals.find((item) => item.id === proposalId);
    if (!proposal) return;

    setBusyProposalId(proposalId);
    try {
      const approvedProposal = await approveCampaignProposal(proposal);
      setSnapshot((current) => ({
        ...current,
        proposals: current.proposals.map((item) =>
          item.id === proposalId ? approvedProposal : item
        )
      }));
      setAnnouncement(`${proposal.title} was approved for configuration review.`);
    } catch (error) {
      setAnnouncement(
        error instanceof Error ? error.message : "The proposal could not be approved."
      );
    } finally {
      setBusyProposalId(null);
    }
  }

  const measurableProposal = snapshot.proposals.find(
    (proposal) => proposal.status === "approved"
  ) ?? snapshot.proposals.find((proposal) => proposal.feasibility.canApprove);

  return (
    <div className="agent-console-page" aria-labelledby="agent-console-title">
      <header className="agent-console-hero">
        <div className="agent-console-hero__copy">
          <p className="agent-console__kicker">{agentConsoleCopy.eyebrow}</p>
          <h1 id="agent-console-title">{agentConsoleCopy.title}</h1>
          <p>{agentConsoleCopy.description}</p>
        </div>
        <aside className="agent-console-boundary" aria-label="Current capability boundary">
          <Activity size={19} aria-hidden="true" />
          <div>
            <span>{agentConsoleCopy.currentBoundary}</span>
            <strong>{agentConsoleCopy.currentBoundaryValue}</strong>
            <small>{agentConsoleCopy.fixtureNotice}</small>
          </div>
        </aside>
      </header>

      <ol className="agent-lifecycle" aria-label="Evolution Agent lifecycle">
        {snapshot.stages.map((stage, index) => {
          const Icon = stageIcons[stage];
          const copy = evolutionStageCopy[stage];
          return (
            <li key={stage}>
              <span className="agent-lifecycle__index">{index + 1}</span>
              <Icon size={18} aria-hidden="true" />
              <div>
                <strong>{copy.label}</strong>
                <small>{copy.description}</small>
              </div>
              {index < snapshot.stages.length - 1 ? (
                <ArrowRight className="agent-lifecycle__arrow" size={15} aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="agent-console__window">
        {snapshot.observationWindow} · generated {new Date(snapshot.generatedAt).toLocaleString()}
      </p>

      <div className="agent-console-grid">
        <section className="agent-console-panel" aria-labelledby="agent-observe-title">
          <div className="agent-console-panel__heading">
            <Eye size={18} aria-hidden="true" />
            <div>
              <p className="agent-console__kicker">Observe</p>
              <h2 id="agent-observe-title">{agentConsoleCopy.observe}</h2>
            </div>
          </div>
          <div className="agent-signal-list">
            {snapshot.signals.map((signal) => {
              const Icon = getSignalIcon(signal);
              return (
                <article className="agent-signal" key={signal.id}>
                  <div className="agent-signal__value">
                    <strong>{signal.displayValue}</strong>
                    <Icon size={17} aria-label={`${signal.trend} trend`} />
                  </div>
                  <h3>{signal.label}</h3>
                  <p>{signal.description}</p>
                  <span>{signal.deltaLabel}</span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="agent-console-panel" aria-labelledby="agent-reason-title">
          <div className="agent-console-panel__heading">
            <BrainCircuit size={18} aria-hidden="true" />
            <div>
              <p className="agent-console__kicker">Reason</p>
              <h2 id="agent-reason-title">{agentConsoleCopy.reason}</h2>
            </div>
          </div>
          <div className="agent-insight-list">
            {snapshot.insights.map((insight) => (
              <article className="agent-insight" key={insight.id}>
                <div className="agent-insight__meta">
                  <span>{insight.confidence} confidence</span>
                  <BrainCircuit size={16} aria-hidden="true" />
                </div>
                <h3>{insight.title}</h3>
                <p>{insight.summary}</p>
                <small>
                  Evidence · {insight.evidenceSignalIds.length} aggregated signal
                  {insight.evidenceSignalIds.length === 1 ? "" : "s"}
                </small>
              </article>
            ))}
          </div>
        </section>

        <section
          className="agent-console-panel agent-console-panel--proposals"
          aria-labelledby="agent-propose-title"
        >
          <div className="agent-console-panel__heading">
            <Sparkles size={18} aria-hidden="true" />
            <div>
              <p className="agent-console__kicker">Propose → Human Approve</p>
              <h2 id="agent-propose-title">{agentConsoleCopy.propose}</h2>
            </div>
          </div>
          <div className="agent-proposal-list">
            {snapshot.proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                busy={busyProposalId === proposal.id}
                onApprove={handleApprove}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="agent-measure" aria-labelledby="agent-measure-title">
        <div className="agent-console-panel__heading">
          <CircleGauge size={18} aria-hidden="true" />
          <div>
            <p className="agent-console__kicker">Measure</p>
            <h2 id="agent-measure-title">{agentConsoleCopy.measure}</h2>
          </div>
        </div>
        {measurableProposal ? (
          <div className="agent-metric-list">
            {measurableProposal.evaluationMetrics.map((metric) => (
              <article key={metric.id}>
                <span>{humanizeId(metric.targetDirection)}</span>
                <strong>{metric.label}</strong>
                <small>Compare against the pre-campaign baseline after the approved window.</small>
              </article>
            ))}
          </div>
        ) : (
          <p>No current proposal can advance to measurement.</p>
        )}
      </section>

      <p className="agent-console-announcement" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
