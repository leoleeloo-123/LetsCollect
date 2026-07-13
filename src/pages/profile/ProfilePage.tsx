import { StateBlock } from "../../components/feedback/StateBlock";
import { PageHeader } from "../../components/ui/PageHeader";

export function ProfilePage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Profile"
        title="Collector profile"
        description="A future home for nickname, avatar, stats, achievements, account settings, and draw history."
      />
      <StateBlock
        title="Profile uses mock state"
        description="Authentication and user data are intentionally not connected in Phase 1."
      />
    </div>
  );
}
