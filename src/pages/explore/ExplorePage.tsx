import { ToyCard } from "../../components/cards/ToyCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { mockToys } from "../../data/mock/toys";

export function ExplorePage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Explore"
        title="Browse collectible toys"
        description="Catalog filters and thumbnail previews will live here. Large GLB files should load only on detail pages or explicit preview."
      />
      <div className="filter-strip" aria-label="Toy filters">
        <button type="button">All</button>
        <button type="button">Owned</button>
        <button type="button">Mythic</button>
        <button type="button">Series</button>
      </div>
      <div className="toy-grid">
        {mockToys.map((toy) => (
          <ToyCard key={toy.id} toy={toy} />
        ))}
      </div>
    </div>
  );
}
