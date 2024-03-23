import { useState } from 'react';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencil, faTrash, faFileImage } from "@fortawesome/free-solid-svg-icons"
import './PostCard.css'
import { useNavigate } from 'react-router-dom';
import ConfirmationPopup from './ConfirmationPopup';
import postApi from '../api/posts';

const DESC_LIMIT = 500;

export default function PostCard({ clubname, postname, postId, contents, isAdmin, img, dateString, isPoster }) {
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    const shortdesc = contents ? (contents.length > DESC_LIMIT ? `${contents.substring(0, DESC_LIMIT)} . . .` : contents) : "";
    const formatedDate = (new Date(dateString)).toDateString();

    const handleEditClick = (e) => {
        e.stopPropagation();
        navigate(`/club/${clubname}/post/edit/${postId}`);
    }

    const handlePosterClick = (e) => {
        e.stopPropagation();
        navigate(`/club/${clubname}/post/${postId}`);
    }

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowConfirmationPopup(true);
    }

    const confirmDelete = async () => {
        try {
            const response = await postApi.deletePost(clubname, postId);
            if (response.status === 200) {
                window.location.reload();
            } else if (response.status === 403) {
                setErrorMessage('Only an admin can delete the event');
            } else if (response.status === 404) {
                setErrorMessage('Event not found');
            }
        } catch (error) {
            console.error('Event deletion failed: ', error);
        }
        setShowConfirmationPopup(false);
    };

    const cancelDelete = () => {
        setShowConfirmationPopup(false); 
    };


    return (
        <Card
            variant="outlined"
            orientation="horizontal"
            sx={{
                width: 300,
                height: 400,
                '&:hover': { boxShadow: 'xl', borderColor: 'black' },
            }}
            style={{backgroundColor: "white"}}
        >
            <CardContent>
                <div className='card-post-content'>
                    <div className='card-post-top'>
                        <img src={img} alt="Company Logo" className="card-post-logo" />
                        <div className='card-post-title-container'>
                            <span className='card-post-name'> {postname} </span>
                        </div>
                    </div>
                    <span className='card-post-club-date'>{formatedDate}</span>
                    <span className='card-post-club-name'> Post from {clubname}:</span>
                    <span className='card-post-desc'> {shortdesc}</span>
                    <div className='card-post-bottom'>
                        {isPoster &&
                            <div className='card-post-poster-icon' onClick={handlePosterClick}>
                                <FontAwesomeIcon icon={faFileImage}  />
                            </div>}
                        {isAdmin &&
                            <div className='card-post-edit-icon' onClick={handleEditClick}>
                                <FontAwesomeIcon icon={faPencil}  />
                            </div>}
                        {isAdmin &&
                            <div className='card-post-delete-icon' onClick={handleDeleteClick}>
                                <FontAwesomeIcon icon={faTrash} />
                            </div>}
                    </div>
                    {showConfirmationPopup && (
                        <ConfirmationPopup
                            message="Are you sure you want to delete this post?"
                            onConfirm={confirmDelete}
                            onCancel={cancelDelete}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}