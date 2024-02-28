import React from 'react';
import Header from '../components/Header';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse} from "@fortawesome/free-solid-svg-icons"
import './homePage.css';

const HomePage = () => {
  return (
    <div className='homePage'>
        <Header/>
        <div className='homePage-container'>
        <div className='homePage-icon'> 
        <FontAwesomeIcon icon={faHouse}></FontAwesomeIcon>
        </div>
        
        <div className='homePage-message'>
            <p>This Page is Under Construction!</p>
        </div>
        </div>
    </div>
  );
};

export default HomePage;
