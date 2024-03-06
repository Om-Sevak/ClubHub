import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './createClubPage.css'; // Import CSS file for styling
import clubApi from '../api/clubs';
import Header from '../components/Header';


const ClubCreatePage = () => {
    const [clubname, setClubName] = useState('');
    const [clubdescription, setClubDescription] = useState('');
    const [clubinterest, setClubInterest] = useState('');
    const [clubemail, setClubEmail] = useState('');
    const [clubImage, setClubImage] = useState(null); // State to store selected image file
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    const handleclubcreate = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            // Create FormData object to append image file
            const formData = new FormData();
            formData.append('name', clubname);
            formData.append('description', clubdescription);
            formData.append('interest', clubinterest);
            formData.append('email', clubemail);
            formData.append('image', clubImage); // Append image file to form data

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
        }
    };
        
    return (
        <div className="create-club-page">
          <Header />
          <div className="create-club-col">
            <div className="create-club-container">
              <h2>Let's create a new club!</h2>
              <form onSubmit={handleclubcreate}>
                {/* Add labels for input fields */}
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
      
                <label htmlFor="clubinterest">
                  Club Interests:
                  <input
                    id="clubinterest"
                    type="text"
                    placeholder="Enter the interests for the club"
                    value={clubinterest}
                    onChange={(e) => setClubInterest(e.target.value)}
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

                {/* Input for file upload */}
                <label htmlFor="clubimage">
                  Club Image:
                  <input
                    id="clubimage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setClubImage(e.target.files[0])} // Store selected image file in state
                  />
                </label>
      
                <button type="submit">Create</button>
              </form>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
          </div>
        </div>
      );
};

export default ClubCreatePage;
