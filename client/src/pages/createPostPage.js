import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';

import './createPostPage.css'; // Import CSS file for styling

import postApi from '../api/posts';

const PostCreatePage = () => {
    const [postTitle, setPostTitle] = useState('');
    const [postContents, setPostContents] = useState('');
    const [postImage, setPostImage] = useState(null);
    const { clubName } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handlepostcreate = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        const postDate = new Date();
        try {
            const formData = new FormData();
            formData.append('title', postTitle);
            formData.append('contents', postContents);
            formData.append('date', postDate);
            formData.append('image', postImage);

            const response = await postApi.createPost(formData, clubName);
            
            if (response.status === 200) {
                navigate(`/club/${clubName}`);
            } else if(response.status === 403){
                setErrorMessage('You must be an admin to create a post for this club');
            }
        } catch (error) {
            console.error('post creation failed: ', error);

        }
    };

    const handleBack = () => {
        navigate(`/club/${clubName}`);
    };

    return (
        <div className="create-post-page">
            <Header />
            <div className="create-post-col">
                <div className="create-post-container">
                    <h2>Create Post</h2>
                    <form onSubmit={handlepostcreate}>
                        <input
                            type="text"
                            placeholder="Enter the title of the post"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Enter the contents for the post"
                            value={postContents}
                            onChange={(e) => setPostContents(e.target.value)}
                            required
                        />
                        <label htmlFor="postimage">
                            Post Image:
                            <input
                                id="postimage"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPostImage(e.target.files[0])}
                            />
                        </label>
                        <br />
                        <button type="submit">Create</button>
                    </form>
                    <button onClick={handleBack}>Back</button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            </div>
        </div>
    );
};

export default PostCreatePage;
