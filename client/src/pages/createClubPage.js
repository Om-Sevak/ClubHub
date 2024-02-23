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
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    const handleclubcreate = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            const response = await clubApi.createClub({ name: clubname, description: clubdescription, email: clubemail});
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
            <div className="login-container">
            <img src={logo} alt="Logo" className="logo" />
                <h2>Let's create a new club!</h2>
                <form onSubmit={handleclubcreate}>
                    <input
                        type="text"
                        placeholder="Enter the name of the club"
                        value={clubname}
                        onChange={(e) => setClubName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter the description for the club"
                        value={clubdescription}
                        onChange={(e) => setClubDescription(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Enter the interests for the club"
                        value={clubinterest}
                        onChange={(e) => setClubInterest(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter the club email"
                        value={clubemail}
                        onChange={(e) => setClubEmail(e.target.value)}
                    />
                    <button type="submit">Create</button>
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default ClubCreatePage;
