import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Calendar from 'react-calendar';

import './editEventPage.css'; // Import CSS file for styling
import eventApi from '../api/events';


const EditEventPage = () => {
    const { clubName, eventId} = useParams();
    const [eventTitle, setEventTitle] = useState('')
    const [eventDescription, setEventDescription] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchEventData = async () => {
            try{
                const { status: reqStatus, data: eventData } = await eventApi.getEvent(clubName, eventId);

                if (reqStatus === 200){
                    setEventTitle(eventData.title)
                    setEventDescription(eventData.description);
                    setEventLocation(eventData.location);
                    setEventDate(eventData.date)
                }
                else if (reqStatus === 404){
                    setErrorMessage("Event does not exist")
                }
            }
            catch (error){
                console.error('unable to get event', error);
                setErrorMessage('Event does not exist');
            }
        };

        fetchEventData();
    }, [clubName])

    const handleEventEdit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            const response = await eventApi.editEvent(clubName, eventId, { title: eventTitle, description: eventDescription, date: eventDate, locaiton: eventLocation});
            if(response.status === 201){
                navigate(`/club/${clubName}/${eventId}`);
            } else if(response.status === 400){
                setErrorMessage(response.error);
            }
            else if(response.status === 403){
                setErrorMessage('Only an admin can edit the event');
            }
        } catch (error) {
            console.error('event update failed: ', error);
            
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="edit-event-page">
            <div className="login-container">
                <h2>Edit Event</h2>
                <form onSubmit={handleEventEdit}>
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
                    <input
                        type="text"
                        placeholder="Enter the event location"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                    />
                    <button type="submit">Save</button>
                </form>
                <button onClick={handleCancel}>Cancel</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default EditEventPage;