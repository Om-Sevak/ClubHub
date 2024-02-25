import React, { useEffect, useState } from 'react';
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import './clubPage.css';
import { useParams } from 'react-router-dom';
import clubApi from '../api/clubs';
import clubRoleApi from '../api/clubRole';
import NotFound from '../components/NotFound';
import eventApi from '../api/events';
import { useNavigate } from 'react-router-dom';

// Header component
const ClubPage = () => {
  const { clubName } = useParams();
  const [clubDescription, setClubDescription] = useState('');
  const [clubExecutives, setClubExecutives] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clubEvents, setClubEvents] = useState([])
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubData = async () => {
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
    };

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

    const fetchClubEvents = async () => {
      
      try {
        console.log(clubName)
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

    fetchClubData();
    fetchUserRoleData();
    fetchClubEvents();

  }, [])

  const handleJoin = async () => {
    try {
      const response = await clubRoleApi.createClubRole(clubName, {role: "member"});
      if(response.status === 200){
          window.location.reload();
      } else if(response.status === 400){
          setErrorMessage(response.error);
      }
      else if(response.status === 403){
          setErrorMessage('You must be signed in to join a club');
      }
    } catch (error) {
        console.error('failed to join club ', error);
        
    }
  }

  //TODO
  const handleLeave = async () => {

  }

  //TODO
  const handleDelete = async () => {

  }



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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toDateString(); 
  };

  return (
    <section className="events">
      <h2>Upcoming Events</h2>
      <ul>
        {clubEvents.map(event => (
          <li key={event._id}>
            <h3>{event.title}</h3>
            <p>Description: {event.description}</p>
            <p>Date: {formatDate(event.date)}</p>
            <p>Location: {event.location}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

  if (errorMessage === 'Club does not exist') {
    return <NotFound />;
  }

  return (
    <div>
        <img src={logo} alt="Logo" className="clubLogo" />
        <Header />
      <main>
        <Banner />
        <About />
        <Events />
        {isAdmin &&<button onClick={handleCreateEventClick}>Create Event</button>}
        {isAdmin ? <button onClick={handleDelete}>Delete Club</button> : <button onClick={isMember ? handleLeave : handleJoin}>{isMember ? 'Leave Club' : 'Join Club'}</button>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </main>
    </div>
  );
};

export default ClubPage;


