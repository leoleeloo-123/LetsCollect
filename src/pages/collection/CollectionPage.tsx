import { ToyCard } from "../../components/cards/ToyCard";
import { StateBlock } from "../../components/feedback/StateBlock";
import { PageHeader } from "../../components/ui/PageHeader";
import { mockToys } from "../../data/mock/toys";

export function CollectionPage() {
  const ownedToys = mockToys.filter((toy) => toy.owned);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Collection"
        title="Your toy shelf"
        description="Collection data is mocked for now. Real user-owned items should move to Supabase later."
      />
      {ownedToys.length > 0 ? (
        <div className="toy-grid">
          {ownedToys.map((toy) => (
            <ToyCard key={toy.id} toy={toy} />
          ))}
        </div>
      ) : (
        <StateBlock
          title="No toys collected yet"
          description="Future users will see owned toys, locked silhouettes, series progress, and obtain dates here."
        />
      )}
    </div>
  );
}
