import React from 'react';
import Header from '../components/Header';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse} from "@fortawesome/free-solid-svg-icons"
import './homePage.css';
import ClubCarousel from '../components/ClubCarousel';
import EventCarousel from '../components/EventCarousel';
import PostCarousel from '../components/PostCarousel';

const HomePage = () => {
  return (
    <div className='homePage'>
        <Header/>
        <div className='homePage-top-msg-row'>
          <span className='homePage-top-msg-row-text'>Welcome to ClubHUB for the University of Manitoba</span>
        </div>
        <div className='homePage-carousel-header-row'>
          <div className='homePage-carousel-header-row-container-first'>
            <span className='homePage-carousel-header-row-text'>Find your people here:</span>
          </div>
        </div>
        <ClubCarousel/>
        <div className='homePage-carousel-header-row'>
        <div className='homePage-carousel-header-row-container'>
          <span className='homePage-carousel-header-row-text'>What's going on around campus:</span>
          </div>
        </div>
        <EventCarousel/>
        <div className='homePage-carousel-header-row'>
        <div className='homePage-carousel-header-row-container'>
          <span className='homePage-carousel-header-row-text'>People are talking! See what about:</span>
          </div>
        </div>
        <PostCarousel />
        <div className='homePage-carousel-header-row'></div>
    </div>
  );
};

export default HomePage;
