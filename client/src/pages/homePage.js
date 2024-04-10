/*********************************************************************************
    FileName: homePage.js
    FileVersion: 1.0
    Core Feature(s): Home Page UI
    Purpose: This file defines the HomePage component, which represents the landing page of the application. It displays a welcome message, carousels for clubs, events, and posts, and provides users with a glimpse of what they can find on the platform. The component includes various CSS styles for layout and design purposes, utilizes the Header component for consistent navigation, and incorporates FontAwesome icons for visual enhancements.
*********************************************************************************/


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
        <div className="geometry-shape-1"></div>
        <div className="geometry-shape-2"></div>
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
