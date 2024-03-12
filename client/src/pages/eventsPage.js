import React, {useState, useEffect} from 'react';
import Header from '../components/Header';
import EventCard from '../components/EventCard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons"
import eventApi from '../api/events';
import { Grid, Pagination } from '@mui/material';
import logo from '../assets/logoIMG.jpeg';
import './eventsPage.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage= 12;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        
        const { status: reqStatus, data: eventData } = await eventApi.getAllEvents();
    
        console.log(eventData);
        if (reqStatus === 200) {
          const totalEvents = eventData.events.length;
          setEvents(eventData.events);
        } else {
          console.error('Error fetching events: Unexpected status', reqStatus);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const totalEvents = events.length;
  const totalPages = Math.ceil(totalEvents / eventsPerPage);


  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const getPageEvents = () => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex +eventsPerPage;
    return events.slice(startIndex, endIndex);
  };

  return (
    <div>
      <Header/>
      <h2>Events Page</h2>
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
          onChange={handleChangePage}
          variant="outlined"
          shape="rounded"
          size="large"
        />
      </div>
    </div>
  );
};

export default EventsPage;