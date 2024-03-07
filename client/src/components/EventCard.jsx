import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import logoIMG from '../assets/logoIMG.jpeg'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencil } from "@fortawesome/free-solid-svg-icons"
import './EventCard.css'
import { useNavigate } from 'react-router-dom';

export default function EventCard({ event, eventId, name, img, isAdmin, dateString }) {
    const navigate = useNavigate();

    const formatedDate = (new Date(dateString)).toDateString();

    const handleCardClick = () => {
        navigate(`/club/${name}/${eventId}`);
        window.location.reload();
    }

    return (
        <Card
            variant="outlined"
            orientation="horizontal"
            sx={{
                width: 660,
                height: 60,
                '&:hover': { boxShadow: 'xl', borderColor: 'neutral.outlinedHoverBorder' },
            }}
            onClick={handleCardClick}
        >
            <CardContent>
                <div className='card-event-content'>
                    <div className='card-event-left-col'>
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
                                <div className='card-event-edit-icon'>
                                    <FontAwesomeIcon icon={faPencil} />
                                </div>}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}