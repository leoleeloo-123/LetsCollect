import { routes } from "../../app/routes";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { ToyViewerPlaceholder } from "../../components/three-viewer/ToyViewerPlaceholder";
import { ToyCard } from "../../components/cards/ToyCard";
import { mockToys } from "../../data/mock/toys";

export function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero-section">
        <div className="hero-section__copy">
          <p className="eyebrow">3D Collectible Platform</p>
          <h1>Collect soft digital toys with stories, rarity, and delight.</h1>
          <p>
            Let's Collect is becoming a mobile-first collectible platform for original
            toys, 3D inspection, collections, and future blind-box draws.
          </p>
          <div className="action-row">
            <ButtonLink to={routes.explore}>Explore toys</ButtonLink>
            <ButtonLink to={routes.draw} variant="secondary">
              Try draw
            </ButtonLink>
          </div>
        </div>
        <ToyViewerPlaceholder title="Featured Toy Preview" />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Featured Set</p>
          <h2>Early collectible lineup</h2>
        </div>
        <div className="toy-grid">
          {mockToys.map((toy) => (
            <ToyCard key={toy.id} toy={toy} />
          ))}
        </div>
      </section>
    </div>
  );
}
