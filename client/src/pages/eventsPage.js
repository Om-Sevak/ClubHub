import React from 'react';
import Header from '../components/Header';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons"
import './eventsPage.css';

const EventsPage = () => {
  return (
    <div className='eventsPage'>
        <Header/>
        <div className='eventsPage-container'>
        <div className='eventsPage-icon'> 
        <FontAwesomeIcon icon={faCalendarDays}></FontAwesomeIcon>
        </div>
        
        <div className='eventsPage-message'>
            <p>This Page is Under Construction!</p>
        </div>
        </div>
    </div>
  );
};

export default EventsPage;
