/*********************************************************************************
  FileName: LoadingSpinner.jsx
  FileVersion: 1.0
  Core Feature(s): Loading spinner component
  Purpose: This component displays a loading spinner while content is being loaded or processed.
*********************************************************************************/


import React from 'react';
import './LoadingSpinner.css'; // Import CSS file for styling

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner-overlay">
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
