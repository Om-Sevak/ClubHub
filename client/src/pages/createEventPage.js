import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';

import './createEventPage.css'; // Import CSS file for styling

import eventApi from '../api/events';

const EventCreatePage = () => {
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const { clubName } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleeventcreate = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            const response = await eventApi.createEvent({ title: eventTitle, description: eventDescription, date: eventDate, location: eventLocation, club: clubName }, clubName);
            if (response.status === 200) {
                navigate(`/club/${clubName}`);
            } else if (response.status === 400) {
                setErrorMessage('Invalid email');
            }
        } catch (error) {
            console.error('event creation failed: ', error);

        }
    };

    const handleBack = () => {
        navigate(`/club/${clubName}`);
    };

    return (
        <div className="create-event-page">
            <Header />
            <div className="create-event-col">
                <div className="create-event-container">
                    <h2>Create Event</h2>
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
                        <br />
                        <input
                            type="text"
                            placeholder="Enter the event location"
                            value={eventLocation}
                            onChange={(e) => setEventLocation(e.target.value)}
                        />
                        <button type="submit">Create</button>
                    </form>
                    <button onClick={handleBack}>Back</button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            </div>
        </div>
    );
};

export default EventCreatePage;
