/*********************************************************************************
	FileName: EventCarousel.jsx
	FileVersion: 1.0
	Core Feature(s): Displaying a carousel of events
	Purpose: This component renders a carousel of events. It fetches events from the API and displays them in a carousel format. The carousel can be navigated vertically and includes arrows for navigation.
*********************************************************************************/

import Slider from "react-slick";
import EventCard from "./EventCard";
import { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp,faChevronDown} from "@fortawesome/free-solid-svg-icons"
import eventApi from "../api/events";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NotFound from '../components/NotFound';

import './EventCarousel.css'

const NUM_CARDS = 12;

const EventCarousel = () => {

  const [events, setEvents] = useState([]);
  const [eventsDoubled, setEventsDoubled ] = useState([]);
  const [doubleEvents, setdoubleEvents] = useState(window.innerWidth>1850);

  useEffect(() => {
  const getEvents = async () => {
      const { status: reqStatus, data: eventsData } = await eventApi.getEventsBrowse({ limit: NUM_CARDS, includeJoined:true });
      if (reqStatus === 200) {
        setEvents(eventsData.events);
        setEventsDoubled(eventsData.events.reduce(function (rows, key, index) { 
            return (index % 2 == 0 ? rows.push([key]) 
              : rows[rows.length-1].push(key)) && rows;
          }, []));
      }
      else {
        return <NotFound />;
      }  
  };

  const handleResize = () => {
    setdoubleEvents(window.innerWidth > 1850); // Adjust the threshold as needed
  };

  window.addEventListener('resize', handleResize);
  getEvents();

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
  
  
  
  const slider = useRef(null);
  var settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 2,
    arrows:false,
    vertical:true,
  };
  return (
    <div className="event-carousel-row">
      <div className="event-carousel-container">
        <Slider ref={slider} {...settings}>
          {doubleEvents ?
            eventsDoubled.map((doubleEvent, key) =>  {
                return (
                  <div key={key} >
                  <div className="event-double-container">
                    <div className="event-carousel-card">
                      <EventCard
                        event={doubleEvent[0].title}
                        eventId={doubleEvent[0]._id}
                        name={doubleEvent[0].clubName}
                        img={doubleEvent[0].imgUrl}
                        dateString={doubleEvent[0].date}
                        />
                    </div>
                    <div className="event-carousel-card">
                      <EventCard
                        event={doubleEvent[1].title}
                        eventId={doubleEvent[1]._id}
                        name={doubleEvent[1].clubName}
                        img={doubleEvent[1].imgUrl}
                        dateString={doubleEvent[1].date}
                        />
                    </div>
                  </div>
                  </div>
                  
            );})
          :
          events.map((event, key) =>  {
            return (
              <div key={key}>
                <div className="event-carousel-card">
                  <EventCard
                    event={event.title}
                    eventId={event._id}
                    name={event.clubName}
                    img={event.imgUrl}
                    dateString={event.date}
                    />
                </div>
              </div>
            );})
        } 
        </Slider>
      </div>
      <div className="event-carousel-icon">
      <button className="event-carousel-nav-button" 
      onClick={() => slider?.current?.slickNext()}>
        <FontAwesomeIcon icon={faChevronDown} />
      </button>
      </div>
    </div>
  );
}

export default EventCarousel;