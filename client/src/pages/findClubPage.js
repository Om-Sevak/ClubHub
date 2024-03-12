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



const FindClubPage = () => {
  const [userInterests, setUserInterests] = useState([
    'Science',
    'Art',
    'Environment',
    'Coolness',
    'Religion'
  ]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState(userInterests);
  const [loggedIn, setLoggedIn] = useState(); // Add loggedIn state
  const wrapperRef = useRef(null);
  const [viewResults, setViewResults] = useState(false);

  useEffect(() => {
    const fetchClubData = async () => {
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
    };

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setViewResults(false);
      } else {
        setViewResults(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    fetchClubData();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  

  const handleEditInterests = () => {
    setSelectedInterests(userInterests);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveInterests = () => {
    setUserInterests(selectedInterests);
    handleCloseModal();
  };

  const handleToggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const availableInterests = [
    'Science',
    'Art',
    'Environment',
    'Coolness',
    'Religion',
    'Technology',
    'Music',
    'Sports',
    'Reading',
    'Writing',
    'Photography',
    'Cooking',
    'Traveling',
    'Fashion',
    // Add more interests here
  ];

  return (
    <div className='findClubPage'>
      <Header />
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
                {Array.from(Array(20)).map((_, index) => (
                  <Grid item key={index}>
                    <ClubCard 
                      name="Test Club Header" 
                      desc="In the quiet dusk, shadows dance, whispering tales of forgotten dreams. Moonlight weaves through branches, a celestial ballet. Nature's lullaby cradles the world, where fleeting moments become timeless memories, etched in the tapestry of existence."
                      img=" "
                      followed={true}
                      interests={['Science', 'Art', 'Environment', 'Coolness', 'Religion']}
                      match={90}
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

