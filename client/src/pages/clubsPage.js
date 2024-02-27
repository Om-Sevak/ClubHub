import React from 'react';
import Header from '../components/Header';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPeopleGroup } from "@fortawesome/free-solid-svg-icons"
import './clubsPage.css';

const ClubsPage = () => {
  return (
    <div className='clubsPage'>
        <Header/>
        <div className='clubsPage-container'>
        <div className='clubsPage-icon'> 
        <FontAwesomeIcon icon={faPeopleGroup}></FontAwesomeIcon>
        </div>
        
        <div className='clubsPage-message'>
            <p>This Page is Under Construction!</p>
        </div>
        </div>
    </div>
  );
};

export default ClubsPage;
