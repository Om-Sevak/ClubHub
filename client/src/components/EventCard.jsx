import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import logoIMG from '../assets/logoIMG.jpeg'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons"
import './EventCard.css'
import { useNavigate } from 'react-router-dom';
import ConfirmationPopup from './ConfirmationPopup';
import eventApi from '../api/events';
import { useState } from 'react';

export default function EventCard({ event, eventId, name, img, isAdmin, dateString }) {
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const formatedDate = (new Date(dateString)).toDateString();

    const handleCardClick = () => {
        navigate(`/club/${name}/${eventId}`);
        window.location.reload();
    }

    const handleEditClick = (e) => {
        e.stopPropagation();
        navigate(`/club/${name}/edit/${eventId}`);
    }

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowConfirmationPopup(true);
    }

    const confirmDelete = async () => {
        try {
            const response = await eventApi.deleteEvent(name, eventId);
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
                width: 660,
                height: 60,
                '&:hover': { boxShadow: 'xl', borderColor: 'neutral.outlinedHoverBorder' },
            }}
        >
            <CardContent>
                <div className='card-event-content'>
                    <div className='card-event-left-col' onClick={handleCardClick}>
                        <img src={logoIMG} alt="Company Logo" className="card-event-logo" />
                        <div className='card-event-title-container'>
                            <span className='card-event-name'>{event}</span>
                            <span className='card-event-club-name'>{name}</span>
                        </div>
                    </div>
                    <div className='card-event-right-col'>
                        <div className='card-event-info-container'>
                            <span className='card-event-club-date'>{formatedDate}</span>
                            {isAdmin &&
                                <div className='card-event-edit-icon' onClick={handleEditClick}>
                                    <FontAwesomeIcon icon={faPencil}  />
                                </div>}
                            {isAdmin &&
                                <div className='card-event-delete-icon' onClick={handleDeleteClick}>
                                    <FontAwesomeIcon icon={faTrash}  />
                                </div>}
                        </div>
                    </div>
                    {showConfirmationPopup && (
                        <ConfirmationPopup
                            message="Are you sure you want to delete this event?"
                            onConfirm={confirmDelete}
                            onCancel={cancelDelete}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}