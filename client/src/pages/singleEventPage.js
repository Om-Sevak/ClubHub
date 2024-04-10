 /*
    FileName: singleEventPage.js
    FileVersion: 1
    Core Feature(s): Have a page for each club, including calendar and general info 
    Purpose: (1-3 sentances): show the event in a single page with detailed information
    */

import React, {useEffect, useState} from 'react';
import './singleEventPage.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import clubRoleApi from '../api/clubRole';
import NotFound from '../components/NotFound';
import eventApi from '../api/events';
import ConfirmationPopup from '../components/ConfirmationPopup';

const SingleEventPage = () => {
    const {clubName, eventId} = useParams();
    const [eventTitle, setEventTitle] = useState('')
    const [eventDescription, setEventDescription] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [isMember, setIsMember] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRoleData = async () => {
            try {
              const { status: reqStatus, data: roleData } = await clubRoleApi.getClubRole(clubName);
      
              // TODO: handle the case where data.role is admin
              if (reqStatus === 200) {
                setIsMember(true);
                if (roleData.data.role === "admin") {
                  setIsAdmin(true);
                }
                else {
                  setIsAdmin(false);
                }
              }
              else if (reqStatus === 404) {
                setIsMember(false);
                setIsAdmin(false);
              }
            }
            catch (error) {
              console.error('there was an error getting the role ', error);
            }
        };

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

        fetchUserRoleData();
        fetchEventData();
    }, [])

    function Title_Header(){
        return (
            <header className='event-page-header'>
                <h1 className='header-h1'>{clubName} Event: {eventTitle}</h1>
            </header>
        )
    }

    function About() {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toDateString();
        };

        return (
          <section className="about" >
            <h2 className='about-h2'>Event Description</h2>
            <p>{eventDescription}</p>
            <p><span className="bold-text">Date:</span> {formatDate(eventDate)}</p>
            <p><span className="bold-text">Location:</span> {eventLocation}</p>
          </section>
        );
    }

    const handleEdit = async() => {
        navigate(`/club/${clubName}/event/edit/${eventId}`);
      }
      //TODO
    const handleDelete = async () => {
        setShowConfirmationPopup(true);
    }

    const confirmDelete = async () => {
        try {
            const response = await eventApi.deleteEvent(clubName, eventId);
            if (response.status === 200) {
                navigate(`/club/${clubName}`);
            } else if (response.status === 403) {
                setErrorMessage('Only an admin can delete the event');
            } else if (response.status === 404) {
                setErrorMessage('Event not found');
            }
        } catch (error) {
            console.error('Event deletion failed: ', error);
        }
        setShowConfirmationPopup(false);
    };

    const cancelDelete = () => {
        setShowConfirmationPopup(false); 
    };
    
    const handleBack = async() => {
        navigate(-1);
    }

    if (errorMessage === 'Event does not exist') {
        return <NotFound />;
    }

    return(
        <div className= 'event-page'>
            <Header />
        <div className= 'event-page-col'>
            <Title_Header />
            <main>
                <About />
                {isAdmin &&<button className='single-event-page-buttons' onClick={handleEdit}>Edit Event</button>}
                {isAdmin &&<button className='single-event-page-buttons' onClick={handleDelete}>Delete Event</button>}
                <button className='single-event-page-buttons' onClick={handleBack}>Back</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </main>
        </div>
        {showConfirmationPopup && (
            <ConfirmationPopup
                message="Are you sure you want to delete this event?"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        )}
        </div>
    )
};

export default SingleEventPage;
