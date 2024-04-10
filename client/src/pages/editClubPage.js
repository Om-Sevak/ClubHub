/*********************************************************************************
    FileName: editClubPage.js
    FileVersion: 1.0
    Core Feature(s): Edit Club Page UI and Logic
    Purpose: This file defines the EditClubPage component, which allows users to edit the details of an existing club. Users can modify the club name, description, email, interests, and upload a new image for the club. The component handles form submission, validates input fields, communicates with the server to update the club information, and provides feedback to the user through error messages and a loading spinner while processing the update request. It also allows users to cancel the editing process and navigate back to the previous page.
*********************************************************************************/

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import './editClubPage.css'; // Import CSS file for styling
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import clubApi from '../api/clubs';
import interestsApi from '../api/interests';
import InterestMultiSelect from '../components/InterestMultiSelect';
import LoadingSpinner from '../components/LoadingSpinner'; // Import the LoadingSpinner component
import Header from '../components/Header';


const EditClubPage = () => {
    const { clubName } = useParams();
    const [clubname, setClubName] = useState('');
    const [clubdescription, setClubDescription] = useState('');
    const [clubinterest, setClubInterest] = useState([]);
    const [clubemail, setClubEmail] = useState('');
    const [clubImage, setClubImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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

        const fetchClubInterests = async () => {
            try {
              const { status: reqStatus, data: interestData } = await interestsApi.getClubInterests(clubName);
              if (reqStatus === 200) {
                const interests = interestData.interests;
                const formattedOptions = interests.map(interest => ({ value: interest, label: interest}));
                setClubInterest(formattedOptions);
              }
              else if (reqStatus === 404) {
                setErrorMessage("Club does not exist")
              }
            }
            catch (error) {
              console.error('unable to get interests ', error);
              setErrorMessage('Club does not exist');
            }
          };

        fetchClubData();
        fetchClubInterests();
    }, [clubName])

    const handleclubEdit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setIsLoading(true);

        const interestNames  = [];
        clubinterest.forEach(interest => {
          interestNames.push(interest.value)
        });

        if(interestNames.length < 5){
            setErrorMessage('Please select at least 5 interests');
            setIsLoading(false);
            return;
        }

        try {
          const formData = new FormData();
          formData.append('name', clubname);
          formData.append('description', clubdescription);
          formData.append('interest', interestNames);
          formData.append('email', clubemail);
          formData.append('image', clubImage);

          const response = await clubApi.editClub(clubName, formData);
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
        } finally {
          setIsLoading(false);
        }
    };

    const handleCancel = () => {
      navigate(-1);
    }
    return (
        <div className="edit-club-page">
          <Header />
          <div className="edit-club-col">
            <div className="edit-club-container">
                <h2>Edit Club</h2>
                <form onSubmit={handleclubEdit}>
                    <label>
                        Club Name:
                        <input
                            type="text"
                            placeholder="Enter the name of the club"
                            value={clubname}
                            onChange={(e) => setClubName(e.target.value)}
                        />
                    </label>

                    <label>
                        Club Description:
                        <input
                            type="text"
                            placeholder="Enter the description for the club"
                            value={clubdescription}
                            onChange={(e) => setClubDescription(e.target.value)}
                        />
                    </label>
                    
                    <label>
                        Club Email:
                        <input
                            type="text"
                            placeholder="Enter the club email"
                            value={clubemail}
                            onChange={(e) => setClubEmail(e.target.value)}
                        />
                    </label>

                    <InterestMultiSelect selectedOptions={clubinterest} setSelectedOptions={setClubInterest}/>

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
                      {!isLoading && <button type="submit">Save</button>}
                      {!isLoading && <button type="button" onClick={handleCancel}>Cancel</button>}
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
          </div>
        </div>
    );
};

export default EditClubPage;
