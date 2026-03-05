export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-info">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line medium" />
      </div>
    </div>
  );
}
