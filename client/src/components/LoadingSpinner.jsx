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
