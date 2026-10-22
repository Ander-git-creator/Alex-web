export default function SectionHeading({ title, subtitle, number }) {
  return <div className="section-heading">
    <div>
      <h2><span className="heading-text">{title}</span> <span className="heading-arrow" aria-hidden="true">↘</span></h2>
      <p>{subtitle}</p>
    </div>
    {number && <span className="section-number">/ {number}</span>}
  </div>;
}
