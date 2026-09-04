export default function CarLoader() {
  return (
    <div className="car-loader" role="status" aria-live="polite" aria-label="Loading EasyPark">
      <div className="car-loader__brand">Easy<span>Park</span></div>
      <div className="car-loader__scene" aria-hidden="true">
        <div className="car-loader__cloud car-loader__cloud--one" />
        <div className="car-loader__cloud car-loader__cloud--two" />
        <div className="car-loader__road">
          <i /><i /><i /><i />
        </div>
        <div className="car-loader__car">
          <div className="car-loader__car-top" />
          <div className="car-loader__car-body"><i /><i /></div>
          <div className="car-loader__wheel car-loader__wheel--left" /><div className="car-loader__wheel car-loader__wheel--right" />
        </div>
      </div>
      <p>Finding your parking space<span className="car-loader__dots">...</span></p>
    </div>
  );
}
