/*********************************************************************************
	FileName: ConfirmationPopup.jsx
	FileVersion: 1.0
	Core Feature(s): Display confirmation dialog with message and buttons
	Purpose: This component renders a confirmation dialog with a message and two buttons: "Yes" and "No". It provides callbacks for handling user confirmation and cancellation actions.
*********************************************************************************/

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
