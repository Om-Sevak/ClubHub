import React from 'react';
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import './clubPage.css';

// Header component
const ClubPage = () => {

function Header() {
  return (
    <header>
      
      <h1>Club Name</h1>
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
      <p>Description of the club and its activities.</p>
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
        <img src={logo} alt="Logo" className="logo" />
      <Header />
      <main>
        <Banner />
        <About />
        <Events />
      </main>
    </div>
  );
};

export default ClubPage;


