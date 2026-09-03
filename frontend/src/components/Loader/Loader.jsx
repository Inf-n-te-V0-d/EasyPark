import React from "react";
import "./loader.css";

const Loader = ({ duration = 700 }) => {
  const durMs = `${duration}ms`;
  return (
    <div className="loader-overlay" role="status" aria-label="Loading content">
      <div className="loader-ring" />

      <div className="loader-bar-wrap" aria-hidden>
        <div className="loader-bar" style={{ "--load-duration": durMs }} />
      </div>

      <div className="loader-dots" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};

export default Loader;
