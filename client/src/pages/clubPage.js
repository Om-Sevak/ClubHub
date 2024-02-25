import React, { useEffect, useState } from 'react';
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import './clubPage.css';
import { useParams } from 'react-router-dom';
import clubApi from '../api/clubs';
import eventApi from '../api/events';
import { useNavigate } from 'react-router-dom';

// Header component
const ClubPage = () => {
  const { clubName } = useParams();
  const [clubDescription, setClubDescription] = useState('');
  const [clubExecutives, setClubExecutives] = useState('');
  const [clubEvents, setClubEvents] = useState('')
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { status: reqStatus, data: clubData } = await clubApi.getClub(clubName);

        if (reqStatus === 200) {
          setClubDescription(clubData.description);
          setClubExecutives(clubData.executives);
        }
        else if (reqStatus === 404) {
          setErrorMessage("Club does not exist")
        }
      }
      catch (error) {
        console.error('unable to get club ', error);
        setErrorMessage('Club does not exist');
      }

      try {
        const { status: reqStatus, data: eventData } = await eventApi.getEventsForClub(clubName);

        if (reqStatus === 200) {
          setClubEvents(eventData.events);
        }
        else if (reqStatus === 404) {
          setErrorMessage("Club does not exist")
        }
      }
      catch (error) {
        console.error('unable to get events ', error);
        setErrorMessage('Club does not exist');
      }
    };

    fetchData();
  }, [])


function Header() {
  return (
    <header>
      
      <h1>{clubName}</h1>
    </header>
  );
}

// Banner component
function Banner() {
  return (
    <section className="banner">
      <h2>Welcome to Our Club</h2>
      {/* Add any additional content for the banner */}
    </section>
  );
}

// About section component
function About() {
  return (
    <section className="about" >
      <h2>About Us</h2>
      <p>{clubDescription}</p>
    </section>
  );
}

const handleCreateEventClick = () => {
  navigate(`/club/createEvent/${clubName}`);
};

// Events section component
function Events() {
  return (
    <section className="events">
      <h2>Upcoming Events</h2>
      <ul>
        {clubEvents.map(event => (
          <li key={event._id}>
            <h3>{event.title}</h3>
            <p>Description: {event.description}</p>
            <p>Date: {event.date}</p>
            <p>Location: {event.location}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}


  return (
    <div>
        <img src={logo} alt="Logo" className="clubLogo" />
        {errorMessage ? null : <Header /> }
      <main>
        {errorMessage ? null : <Banner /> }
        {errorMessage ? null : <About /> }
        {errorMessage ? null : <Events /> }
        <button onClick={handleCreateEventClick}>Create Event</button>{/* need to hide if non-admin*/}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </main>
    </div>
  );
};

export default ClubPage;


