import React from 'react';
import './ConfirmationPopup.css'

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
    return (
        <div>
            <div className="confirmation-background"></div>
            <div className="confirmation-dialog">
                <p>{message}</p>
                <div className="confirmation-buttons">
                    <button onClick={onConfirm}>Yes</button>
                    <button onClick={onCancel}>No</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;
