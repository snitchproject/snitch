import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-text">Page not found</p>
      <a href="/" className="not-found-link">Go home</a>
    </div>
  );
}

export default NotFound;
