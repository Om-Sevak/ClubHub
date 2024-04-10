/*********************************************************************************
    FileName: createClubPage.js
    FileVersion: 1.0
    Core Feature(s): Club Creation Page UI and Logic
    Purpose: This file defines the ClubCreatePage component, which allows users to create a new club by providing club name, description, email, interests, and an optional club image. It handles form submission, validates input fields, and communicates with the server to create the club. The component displays error messages and a loading spinner while processing the club creation request.
*********************************************************************************/


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './createClubPage.css'; // Import CSS file for styling
import clubApi from '../api/clubs';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner'; // Import the LoadingSpinner component
import InterestMultiSelect from '../components/InterestMultiSelect';

const ClubCreatePage = () => {
    const [clubname, setClubName] = useState('');
    const [clubdescription, setClubDescription] = useState('');
    const [clubinterest, setClubInterest] = useState([]);
    const [clubemail, setClubEmail] = useState('');
    const [clubImage, setClubImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const minRequiredInterests = 5;
    
    const handleclubcreate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const interestNames  = [];
        clubinterest.forEach(interest => {
          interestNames.push(interest.value)
        });

        if(interestNames.length < minRequiredInterests){
            setIsLoading(false);
            setErrorMessage('Please select at least '+  minRequiredInterests +' interests.')
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', clubname);
            formData.append('description', clubdescription);
            formData.append('interest', interestNames);
            formData.append('email', clubemail);
            formData.append('image', clubImage);

            const response = await clubApi.createClub(formData);
            if(response.status === 200){
                navigate('/');
            } else if(response.status === 400){
                setErrorMessage(response.error);
            }
            else if(response.status === 403){
                setErrorMessage('You must be signed in to create a club');
            }
        } catch (error) {
            console.error('club creation failed: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="create-club-page">
          <Header />
          <div className="create-club-col">
            <div className="create-club-container">
              <h2>Let's create a new club!</h2>
              <form onSubmit={handleclubcreate}>
                <label htmlFor="clubname">
                  Club Name:
                  <input
                    id="clubname"
                    type="text"
                    placeholder="Enter the name of the club"
                    value={clubname}
                    onChange={(e) => setClubName(e.target.value)}
                  />
                </label>
      
                <label htmlFor="clubdescription">
                  Club Description:
                  <input
                    id="clubdescription"
                    type="text"
                    placeholder="Enter the description for the club"
                    value={clubdescription}
                    onChange={(e) => setClubDescription(e.target.value)}
                  />
                </label>
      
                <label htmlFor="clubemail">
                  Club Email:
                  <input
                    id="clubemail"
                    type="text"
                    placeholder="Enter the club email"
                    value={clubemail}
                    onChange={(e) => setClubEmail(e.target.value)}
                  />
                </label>

                <InterestMultiSelect selectedOptions={clubinterest} setSelectedOptions={setClubInterest} minRquired={minRequiredInterests}/>

                <label htmlFor="clubimage">
                  Club Image:
                  <input
                    id="clubimage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setClubImage(e.target.files[0])}
                  />
                </label>
      
                {/* Conditionally render the loading spinner */}
                {isLoading && <LoadingSpinner />}
                {!isLoading && <button type="submit">Create</button>}
              </form>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
          </div>
        </div>
      );
};

export default ClubCreatePage;
