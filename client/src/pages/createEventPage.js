import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { useParams } from 'react-router-dom';

import './createEventPage.css'; // Import CSS file for styling
//import 'react-calendar/dist/Calendar.css';

import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import eventApi from '../api/events';

const EventCreatePage = () => {
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const {name} = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    const handleeventcreate = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            const response = await eventApi.createEvent({ title: eventTitle, description: eventDescription, date: eventDate, location: eventLocation, club: name});
            if(response.status === 200){
                navigate('/');
            } else if(response.status === 400){
                setErrorMessage('Invalid email');
            }
        } catch (error) {
            console.error('event creation failed: ', error);
            
        }
    };
    return (
        <div className="create-event-page">
            <div className="login-container">
            <img src={logo} alt="Logo" className="logo" />
                <h2>Create Event for {name}</h2>
                <form onSubmit={handleeventcreate}>
                    <input
                        type="text"
                        placeholder="Enter the title of the event"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter the description for the event"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                    />
                    <label>Date:</label>
                    <div className="calendar-container">
                        <Calendar onChange={setEventDate} value={eventDate} />
                    </div>
                    <br/>
                    <input
                        type="text"
                        placeholder="Enter the event location"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                    />
                    <button type="submit">Create</button>
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default EventCreatePage;
