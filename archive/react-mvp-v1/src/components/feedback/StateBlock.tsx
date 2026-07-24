type StateBlockProps = {
  title: string;
  description: string;
  tone?: "loading" | "empty" | "error";
};

export function StateBlock({ title, description, tone = "empty" }: StateBlockProps) {
  return (
    <section className={`state-block state-block--${tone}`}>
      <div className="state-block__orb" />
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
