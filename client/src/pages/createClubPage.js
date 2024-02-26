import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './createClubPage.css'; // Import CSS file for styling
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import clubApi from '../api/clubs';


const ClubCreatePage = () => {
    const [clubname, setClubName] = useState('');
    const [clubdescription, setClubDescription] = useState('');
    const [clubinterest, setClubInterest] = useState('');
    const [clubemail, setClubEmail] = useState('');
    const [clubLogo, setClubLogo] = useState(null); // State to store uploaded logo file
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    const handleclubcreate = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            // Create form data to include the uploaded logo file
            const formData = new FormData();
            formData.append('name', clubname);
            formData.append('description', clubdescription);
            formData.append('email', clubemail);
            formData.append('logo', clubLogo); // Append uploaded logo file
            
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
    
    // Function to handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setClubLogo(file);
    };
    
    return (
        <div className="create-club-page">
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
    
              <label htmlFor="clublogo">
                Club Logo:
                <input
                  id="clublogo"
                  type="file"
                  accept="image/*" // Allow only image files
                  onChange={handleFileUpload}
                />
              </label>
    
              <button type="submit">Create</button>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </div>
      );
};

export default ClubCreatePage;
