import React from 'react';
import Header from '../components/Header';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsersViewfinder } from "@fortawesome/free-solid-svg-icons"
import './findClubPage.css';

const FindClubPage = () => {
  return (
    <div className='findClubPage'>
        <Header/>
        <div className='findClubPage-container'>
        <div className='findClubPage-icon'> 
        <FontAwesomeIcon icon={faUsersViewfinder}></FontAwesomeIcon>
        </div>
        
        <div className='findClubPage-message'>
            <p>This Page is Under Construction!</p>
        </div>
        </div>
    </div>
  );
};

export default FindClubPage;
