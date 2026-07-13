type ToyViewerPlaceholderProps = {
  title?: string;
};

export function ToyViewerPlaceholder({ title = "3D Viewer" }: ToyViewerPlaceholderProps) {
  return (
    <section className="viewer-placeholder" aria-label={title}>
      <div className="viewer-placeholder__stage">
        <div className="viewer-placeholder__toy" />
      </div>
      <div>
        <p className="eyebrow">3D Module Placeholder</p>
        <h2>{title}</h2>
        <p>
          The verified GLB loader will move here in Phase 2. This placeholder keeps the
          page structure mobile-first without loading the heavy model yet.
        </p>
      </div>
    </section>
  );
}
