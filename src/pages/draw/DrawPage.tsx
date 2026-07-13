import { StateBlock } from "../../components/feedback/StateBlock";
import { PageHeader } from "../../components/ui/PageHeader";

export function DrawPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Draw"
        title="Blind-box draw flow"
        description="This page reserves the product structure for draw pools, cost display, animation, results, and probability disclosure."
      />
      <StateBlock
        tone="empty"
        title="Draw system is not active yet"
        description="Phase 1 keeps this as a safe shell. Mock probability data and animations will be added after the page structure settles."
      />
    </div>
  );
}
