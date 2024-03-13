import React, {useState, useEffect} from 'react';
import Header from '../components/Header';
import EventCard from '../components/EventCard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons"
import eventApi from '../api/events';
import authApi from "../api/auth";
import { Grid, Pagination , Checkbox} from '@mui/material';
import logo from '../assets/logoIMG.jpeg';
import './eventsPage.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loggedIn, setLoggedIn] = useState();
  const [showRegisteredClubsOnly, setShowRegisteredClubsOnly] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const eventsPerPage= 12;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { status: reqStatus, data: reqData } = await authApi.loginStatus();
        if (reqStatus === 200) {
          setLoggedIn(reqData.loggedInStatus);
        } else {
          throw new Error("Server Error");
        }
      } catch (error) {
        console.error('Auth Error', error);
      }

      if (loggedIn){
        try {       
          const { status: reqStatus, data: eventData } = await eventApi.getUserEvents();
          if (reqStatus === 200) {
            console.log(eventData.events);
            setUserEvents(eventData.events);
            console.log(userEvents);
          } else {
            console.error('Error fetching user events: Unexpected status', reqStatus);
          }
        } catch (error) {
          console.error('Error fetching user events:', error);
        }
      }
      try {       
        const { status: reqStatus, data: eventData } = await eventApi.getAllEvents();
        if (reqStatus === 200) {
          
          setEvents(eventData.events);
          setTotalEvents(eventData.events.length);
          setTotalPages(Math.ceil(eventData.events.length / eventsPerPage));
        } else {
          console.error('Error fetching events: Unexpected status', reqStatus);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [loggedIn]);

  


  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const getPageEvents = () => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex +eventsPerPage;
    const eventsToDisplay = showRegisteredClubsOnly ? userEvents : events;
    return eventsToDisplay.slice(startIndex, endIndex);
  };

  const handleCheckboxChange = (event) => {
    setShowRegisteredClubsOnly(event.target.checked);
    const eventsToDisplay = event.target.checked ? userEvents : events;
    const newTotalEvents = eventsToDisplay.length;
    const newTotalPages = Math.ceil(newTotalEvents / eventsPerPage);
    setTotalEvents(newTotalEvents);
    setTotalPages(newTotalPages);
    setCurrentPage(1);
  };


  return (
    <div>
      <Header/>
      <h2>Events Page</h2>
      {loggedIn && (
        <label>
          <Checkbox
              checked={showRegisteredClubsOnly}
              onChange={handleCheckboxChange}
              inputProps={{ 'aria-label': 'show-registered-clubs-only' }}
          />
          Show only events from registered clubs
      </label>
      )}
      <Grid container spacing={3} lassName="events-grid">
        {getPageEvents().map(event => (
          <Grid item key={event._id} xs={12} sm={12} md={12} lg={6} className='event-grid-item'> 
            <EventCard
              event={event.title}
              eventId={event._id}
              name={event.club ? event.club.name : "Unknown Club"}
              img = {event.club ? (event.club.imgUrl ? event.club.imgUrl : logo) : logo}
              isAdmin={false}
              dateString={event.date}
            />
          </Grid>
        ))}
      </Grid>
      <div className="pagination-container">
        <Pagination
          count={totalPages}
          page={currentPage}
          className='pagination'
          color = 'primary'
          onChange={handleChangePage}
          sx ={{marginTop: 2, display: 'flex', justifyContent: 'center'}}
        />
      </div>
    </div>
  );
};

export default EventsPage;