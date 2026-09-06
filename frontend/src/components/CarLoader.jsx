export default function CarLoader() {
  return (
    <div className="car-loader" role="status" aria-live="polite" aria-label="Loading EasyPark">
      <div className="car-loader__mark" aria-hidden="true">
        <div className="car-loader__ring" />
        <div className="car-loader__logo-wrap">
          <img src="/Logo_icon.png" alt="" className="car-loader__logo" />
        </div>
      </div>

      <div className="car-loader__brand">Easy<span>Park</span></div>
      <p>Park easy. Move freely<span className="car-loader__dots">...</span></p>
    </div>
  );
}
