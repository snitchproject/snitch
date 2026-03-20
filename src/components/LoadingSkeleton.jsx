import './LoadingSkeleton.css';

function LoadingSkeleton() {
  return (
    <div className="skeleton fade-in">
      <div className="skeleton-score"></div>
      <div className="skeleton-bar"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text short"></div>
      <div className="skeleton-tags">
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag"></div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
