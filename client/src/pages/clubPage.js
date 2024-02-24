import React, { useEffect, useState } from 'react';
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import './clubPage.css';
import { useParams } from 'react-router-dom';
import clubApi from '../api/clubs';

// Header component
const ClubPage = () => {
  const { clubName } = useParams();
  const [clubDescription, setClubDescription] = useState('');
  const [clubExecutives, setClubExecutives] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

// Events section component
function Events() {
  return (
    <section className="events" >
      <h2>Upcoming Events</h2>
      <ul>
        <li>Event 1 - Date</li>
        <li>Event 2 - Date</li>
        {/* Add more events as needed */}
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
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </main>
    </div>
  );
};

export default ClubPage;


