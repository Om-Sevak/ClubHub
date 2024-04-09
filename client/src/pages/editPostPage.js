import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Calendar from 'react-calendar';

import './editPostPage.css'; // Import CSS file for styling
import postApi from '../api/posts';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';


const EditPostPage = () => {
    const [postTitle, setPostTitle] = useState('');
    const [postContents, setPostContents] = useState('');
    const [postImage, setPostImage] = useState(null);
    const { clubName, postId } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchPostData = async () => {
            try{
                const { status: reqStatus, data: postData } = await postApi.getPost(clubName, postId);

                if (reqStatus === 200){
                    setPostTitle(postData.title)
                    setPostContents(postData.content);
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

    const handlePostEdit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            const formData = new FormData();
            formData.append('title', postTitle);
            formData.append('content', postContents);
            formData.append('image', postImage);
            const response = await postApi.editPost(clubName, postId, formData);
            
            if(response.status === 201){
                navigate(-1);
            } else if(response.status === 400){
                setErrorMessage(response.error);
            }
            else if(response.status === 403){
                setErrorMessage('Only an admin can edit the post');
            }
        } catch (error) {
            console.error('post update failed: ', error);
            
        } finally {
            setIsLoading(false)
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="edit-post-page">
            <Header />
            <div className="edit-post-col">
                <div className="edit-post-container">
                    <h2>Edit Post</h2>
                    <form onSubmit={handlePostEdit}>
                        <input
                            type="text"
                            placeholder="Enter the title of the post"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Enter the contents for the post"
                            value={postContents}
                            onChange={(e) => setPostContents(e.target.value)}
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
                        {isLoading && <LoadingSpinner />}
                        {!isLoading && <button type="submit">Save</button>}
                    </form>
                     {/* Conditionally render the loading spinner */}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            </div>
        </div>
    );
};

export default EditPostPage;