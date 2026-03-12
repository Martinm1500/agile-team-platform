// components/common/Spinner.tsx
import React from "react";
import "./Spinner.css";

const Spinner: React.FC = () => {
  return (
    <div className="spinner-container">
      <div className="spinner-wrapper">
        <div className="modern-spinner">
          <div className="spinner-orbits">
            <div className="orbit orbit-1"></div>
            <div className="orbit orbit-2"></div>
            <div className="orbit orbit-3"></div>
            <div className="spinner-core"></div>
          </div>
          <div className="spinner-text">
            <span className="loading-text">Loading</span>
            <span className="loading-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </span>
          </div>
          <div className="spinner-subtitle">Preparing your experience</div>
        </div>
      </div>
    </div>
  );
};

export default Spinner;
