import React, { useState } from 'react';

import './createClubPage.css'; // Import CSS file for styling
import logo from '../assets/logoIMG.jpeg'; // Import your logo image


const ClubCreatePage = () => {
    const [clubname, setClubName] = useState('');
    const [clubdescription, setClubDescription] = useState('');
    const [clubinterest, setClubInterest] = useState('');
    const [clubemail, setClubEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    

    const handleclubcreate = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {

        } catch (error) {
            console.error('login failed: ', error);
            setErrorMessage('Invalid email or password');
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
