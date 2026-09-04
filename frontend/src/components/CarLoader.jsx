export default function CarLoader() {
  return (
    <div className="car-loader" role="status" aria-live="polite" aria-label="Loading EasyPark">
      <div className="car-loader__brand">Easy<span>Park</span></div>

      <div className="car-loader__scene" aria-hidden="true">
        <div className="car-loader__sun" />
        <div className="car-loader__sparkle car-loader__sparkle--one" />
        <div className="car-loader__sparkle car-loader__sparkle--two" />
        <div className="car-loader__sparkle car-loader__sparkle--three" />

        <div className="car-loader__cloud car-loader__cloud--one" />
        <div className="car-loader__cloud car-loader__cloud--two" />

        <div className="car-loader__road">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="car-loader__smoke" aria-hidden="true">
          <span className="car-loader__smoke-puff car-loader__smoke-puff--one" />
          <span className="car-loader__smoke-puff car-loader__smoke-puff--two" />
          <span className="car-loader__smoke-puff car-loader__smoke-puff--three" />
        </div>

        <div className="car-loader__car">
          <div className="car-loader__car-shadow" />
          <div className="car-loader__car-top">
            <span />
            <i />
          </div>
          <div className="car-loader__car-body">
            <i />
            <i />
            <em />
          </div>
          <div className="car-loader__wheel car-loader__wheel--left"><span /></div>
          <div className="car-loader__wheel car-loader__wheel--right"><span /></div>
          <div className="car-loader__headlight" />
          <div className="car-loader__taillight" />
        </div>
      </div>

      <p>Finding your parking space<span className="car-loader__dots">...</span></p>
    </div>
  );
}
