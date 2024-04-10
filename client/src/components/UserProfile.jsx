/*********************************************************************************
  FileName: UserProfile.jsx
  FileVersion: 1.0
  Core Feature(s): User profile modal with change password functionality
  Purpose: This component renders a user profile modal with the option to change password.
**********************************************************************************/

import React, { useState } from 'react';
import { Modal} from '@mui/material';
import './UserProfile.css';
import { useToast } from '../components/ToastContext';
import authApi from "../api/auth";

const UserProfile = ({ loggedIn, firstName, lastName, userEmail }) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { showToast } = useToast();

  const handleOpenProfileModal = () => {
    setProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setShowChangePassword(false);
    setErrorMessage('');
    setConfirmNewPassword('');
    setCurrentPassword('');
    setNewPassword('');
    setProfileModalOpen(false);
    
  };

  const handleSave = async () => {
    
    if( currentPassword === "" || newPassword === "" || confirmNewPassword === "" ){
      setErrorMessage("Please fill in all fields");
      return;
    }

    if(newPassword !== confirmNewPassword){
      setErrorMessage("Confirmation password do not match");
      return;
    }

    if(newPassword.length < 8){
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    if(newPassword === currentPassword){
      setErrorMessage("New password must be different from current password");
      return;
    }

    try {
      const response = await authApi.changePassword({
        currentPassword,
        newPassword
      });

      if (response.status === 200) {
        setErrorMessage('');
        setShowChangePassword(false);
        setConfirmNewPassword('');
        setCurrentPassword('');
        setNewPassword('');
        showToast("Password changed successfully");
      } else {
        setErrorMessage(response.error);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }


  };

  const handleCancel = () => {
    setShowChangePassword(false);
    setErrorMessage('');
    setConfirmNewPassword('');
    setCurrentPassword('');
    setNewPassword('');
  }

  return (
    <>
      {loggedIn && (
        <>
          <button className="header-welcome-message" onClick={handleOpenProfileModal}>
            Hello, {firstName}
          </button>
          <Modal open={profileModalOpen} onClose={handleCloseProfileModal}>
            <div className="profile-modal">
            <h2>User Profile</h2>
              <div className='user-profile-information-container'>
                <p>Name: {firstName + " " + lastName}</p>
                <p>Email: {userEmail}</p>
              </div>
        
              {(!showChangePassword) && <button className='user-profile-button' onClick={() => setShowChangePassword(true)}>Change Password</button>}

              {showChangePassword && (
                  <div className='change-password-container'>
                      <h3>Change Password</h3> 
                      <input
                      placeholder="Current Password"
                      className='user-profile-input'
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    
                    <input
                      placeholder="New Password"
                      type="password"
                      className='user-profile-input'
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                      placeholder="Confirm New Password"
                      type="password"
                      className='user-profile-input'
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {<button className='user-profile-button' onClick={handleSave}>Save</button>}
                    {<button className='user-profile-button' onClick={handleCancel}>Cancel</button>}
                   
                  </div>
              )}

              <div className='user-profile-button-container'>               
                <button className='user-profile-button' onClick={handleCloseProfileModal}>Close</button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default UserProfile;
