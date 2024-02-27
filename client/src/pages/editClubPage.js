import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import './createClubPage.css'; // Import CSS file for styling
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import clubApi from '../api/clubs';


const EditClubPage = () => {
    const { clubName } = useParams();
    const [clubname, setClubName] = useState('');
    const [clubdescription, setClubDescription] = useState('');
    const [clubinterest, setClubInterest] = useState('');
    const [clubemail, setClubEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchClubData = async () => {
          try {
            const { status: reqStatus, data: clubData } = await clubApi.getClub(clubName);
    
            if (reqStatus === 200) {
              setClubName(clubData.name);
              setClubEmail(clubData.email)
              setClubDescription(clubData.description);
            }
            else if (reqStatus === 404) {
              setErrorMessage("Club does not exist")
            }
          }
          catch (error) {
            console.error('unable to get club ', error);
            setErrorMessage('Club does not exist');
          }
        };

        fetchClubData();
    }, [])

    const handleclubEdit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            const response = await clubApi.editClub(clubName, { name: clubname, description: clubdescription, email: clubemail});
            if(response.status === 201){
                navigate(`/club/${clubname}`);
            } else if(response.status === 400){
                setErrorMessage(response.error);
            }
            else if(response.status === 403){
                setErrorMessage('Only an admin can edit the club');
            }
        } catch (error) {
            console.error('club creation failed: ', error);
            
        }
    };
    return (
        <div className="create-club-page">
            <div className="login-container">
            <img src={logo} alt="Logo" className="logo" />
                <h2>Edit Club</h2>
                <form onSubmit={handleclubEdit}>
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
                    <button type="submit">Save</button>
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default EditClubPage;
