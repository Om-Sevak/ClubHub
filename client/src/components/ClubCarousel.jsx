/*********************************************************************************
	FileName: ClubCarousel.jsx
	FileVersion: 1.0
	Core Feature(s): Display carousel of club cards, navigation buttons
	Purpose: This component renders a carousel of club cards, allowing users to browse through clubs. It fetches clubs from the API, sets up settings for the Slider component, and provides navigation buttons for users to scroll through the carousel.
*********************************************************************************/

import Slider from "react-slick";
import ClubCard from "./ClubCard";
import { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft,faChevronRight } from "@fortawesome/free-solid-svg-icons"
import clubApi from "../api/clubs";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NotFound from '../components/NotFound';

import './CardCarousel.css'

const NUM_CARDS = 12;

const ClubCarousel = () => {

  const [clubs, setClubs] = useState([]);

  useEffect(() => {
  const getClubs = async () => {
      const { status: reqStatus, data: clubsData } = await clubApi.getClubsBrowse({ limit: NUM_CARDS, includeJoined:true });
      if (reqStatus === 200) {
        setClubs(clubsData.clubs);
      }
      else {
        return <NotFound />;
      }  
  };
   getClubs();
}, []);
  
  
  
  const slider = useRef(null);
  var settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 2,
    arrows:false,
    responsive: [
      {
        breakpoint: 1800,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 1350,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  return (
    <div className="carousel-row">
      <div className="carousel-icon">
      <button className="carousel-nav-button" 
      onClick={() => slider?.current?.slickPrev()}>
        <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        </div>
      <div className="carousel-container">
        <Slider ref={slider} {...settings}>
          {clubs.map((club, key) =>  {
            return (
              <div key={key}>
                <div className="carousel-card">
                  <ClubCard
                    name={club.name}
                    desc={club.description}
                    img={club.imgUrl}
                    followed={club.isJoined}
                    interests={club.interests} />
                </div>
              </div>
            );
          })}
          
        </Slider>
      </div>
      <div className="carousel-icon">
      <button className="carousel-nav-button" 
      onClick={() => slider?.current?.slickNext()}>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
      </div>
    </div>
  );
}

export default ClubCarousel;