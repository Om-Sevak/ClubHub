/*********************************************************************************
    FileName: PosterPage.js
    FileVersion: 1.0
    Core Feature(s): Displaying Post Image
    Purpose: This file defines the PosterPage component, which is responsible for displaying the image associated with a specific post. It receives the clubName and postId parameters from the URL and uses them to fetch the post data, including the image URL, from the API. The component then renders the Poster component, passing the image URL as a prop.
*********************************************************************************/

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Calendar from 'react-calendar';

import './editPostPage.css'; // Import CSS file for styling
import postApi from '../api/posts';
import Poster from '../components/Poster';


const PosterPage = () => {
    const [postImage, setPostImage] = useState(null);
    const { clubName, postId } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchPostData = async () => {
            try{
                const { status: reqStatus, data: postData } = await postApi.getPost(clubName, postId);

                if (reqStatus === 200){
                    setPostImage(postData.imgUrl)
                }
                else if (reqStatus === 404){
                    setErrorMessage("Post does not exist")
                }
            }
            catch (error){
                console.error('unable to get post', error);
                setErrorMessage('Post does not exist');
            }
        };

        fetchPostData();
    }, [clubName])

    return (
        <div>
            <Poster imageUrl={postImage} />
        </div>
    )

}

export default PosterPage;