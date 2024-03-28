import React, { useState,  useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Modal from '@mui/material/Modal';
import Header from '../components/Header';
import './findClubPage.css';
import ClubCard from '../components/ClubCard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faUsersViewfinder } from "@fortawesome/free-solid-svg-icons";
import authApi from "../api/auth";
import interestAPI from "../api/interests";
import clubApi from '../api/clubs';
import LoadingSpinner from '../components/LoadingSpinner';

const FindClubPage = () => {
  const [userInterests, setUserInterests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState(userInterests);
  const [loggedIn, setLoggedIn] = useState(); // Add loggedIn state
  const [availableInterests, setAvailableInterests] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { status: reqStatus, data: reqData } = await authApi.loginStatus();
      if (reqStatus === 200) {
        setLoggedIn(reqData.loggedInStatus);
      } else {
        throw new Error("Server Error");
      }
    } catch (error) {
      console.error('Auth Error', error);
    }

    try {
      const { status: reqStatus, data: reqData } = await interestAPI.getAllInterests();
      if (reqStatus === 200) {
        setAvailableInterests(reqData.interests);
      } else {
        throw new Error("Server Error");
      }
    } catch (error) {
      console.error('Auth Error', error);
    }

    try {
      const { status: reqStatus, data: reqData } = await interestAPI.getUserInterests('userInterest');
      if (reqStatus === 200) {
        setUserInterests(reqData.interests);
      } else {
        throw new Error("Server Error");
      }
    } catch (error) {
      console.error('Interest Error', error);
    }

    try {
      const body = {
        "includeJoined": false,
        "limit": 8,
      }
      const { status: reqStatus, data: reqData } = await clubApi.getClubsBrowse(body);
      if (reqStatus === 200) {
        setClubs(reqData.clubs);
      } else {
        throw new Error("Server Error");
      }
    } catch (error) {
      console.error('Interest Error', error);
    }
    setIsLoading(false);

  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleEditInterests = () => {
    setSelectedInterests(userInterests);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveInterests = () => {
    if (selectedInterests.length < 3) {
      setErrorMessage('Please select at least three interests');
      return; // Prevent saving if less than three interests are selected
    }
  
    setUserInterests(selectedInterests);
    const saveInterest = async () => {
      try {
        const { status: reqStatus, data: reqData } = await interestAPI.editUserInterests(selectedInterests);
        if (reqStatus === 200) {
          fetchData();
        } else {
          throw new Error("Server Error");
        }
      } catch (error) {
        console.error('Interest Error', error);
      }
    };
    saveInterest();
    setErrorMessage('');
    handleCloseModal();
  };

  const handleToggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };


  return (
    <div className='findClubPage'>
      <Header />
      {isLoading && <LoadingSpinner />}
      {loggedIn && (
        <div className='findClubPage-container'>
          <div>
            <div className='findClubPage-interests'>
              <div>
                <h3>Your Interests:</h3>
              </div>
              <div className='wrapper-interest'>
                <div className='interests-chips'>
                  {userInterests.map((interest, index) => (
                    <Chip
                      key={index}
                      clickable
                      label={interest}
                      variant="filled"
                      color= "info"
                      style={{ marginRight: '5px', marginBottom: '8px' }}
                    />
                  ))}
                </div>
                <button className='edit-interest-button' onClick={handleEditInterests}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </div>
            </div>
            <div className='findClubPage-clubs'>
              <h1>Recommended clubs based on your interests</h1>
              <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 'auto', sm: 'auto', md: 'auto'}}>
                {Array.from(clubs).map(( club, index) => (
                  <Grid item key={index}>
                    <ClubCard 
                      name= {club.name} 
                      desc={club.description}
                      img= {club.imgUrl}
                      interests={club.interests}
                      match={club.percentMatch}
                    />
                  </Grid>
                ))}
              </Grid>
            </div>
          </div>
          {/* Edit Interests Modal */}
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="edit-interests-modal"
            aria-describedby="modal to edit user interests"
          >
            <div className="edit-interests-modal">
              <h2 id="edit-interests-modal">Edit Interests</h2>
              <div>
                {availableInterests.map((interest, index) => (
                  <Chip
                    key={index}
                    clickable
                    label={interest}
                    color={selectedInterests.includes(interest) ? "primary" : "default"}
                    onClick={() => handleToggleInterest(interest)}
                    style={{ marginRight: '5px', marginBottom: '8px' }}
                  />
                ))}
              </div>
              <button className='save-button' onClick={handleSaveInterests}>Save</button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
            
          </Modal>
        </div>
      )}{(loggedIn === false) && (
        <div className='findClubPage-container'>
          <div className='findClubPage-icon'> 
          <FontAwesomeIcon icon={faUsersViewfinder}></FontAwesomeIcon>
          </div>
          <div className='findClubPage-message'>
              <p>Please login to find clubs based on your interest!</p>
          </div>
        </div>
      )}
    </div>
  );
};



export default FindClubPage;

