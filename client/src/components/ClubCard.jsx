import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Chip from '@mui/joy/Chip';
import logoIMG from '../assets/logoIMG.jpeg'
import './ClubCard.css'
import { useNavigate } from 'react-router-dom';

const DESC_LIMIT = 200;

export default function ClubCard({ name, desc, img, followed, interests, match }) {
    const navigate = useNavigate();

    const shortdesc = desc.length > DESC_LIMIT ? `${desc.substring(0, DESC_LIMIT)} . . .` : desc;

    // Determine the color based on match percentage
    let matchColor;
    if (match >= 80) {
        matchColor = 'green';
    } else if (match >= 40) {
        matchColor = 'orange';
    } else {
        matchColor = 'red';
    }

    const handleCardClick = () => {
        navigate(`/club/${name}`);
        window.location.reload();
    }

    return (
        <Card
            variant="outlined"
            orientation="horizontal"
            sx={{
                width: 300,
                height: 300,
                '&:hover': { boxShadow: 'xl', borderColor: 'neutral.outlinedHoverBorder' },
            }}
            onClick={handleCardClick}
        >
            <CardContent>
                <div className='card-club-content'>
                    <div className='card-club-top'>
                        <img src={logoIMG} alt="Company Logo" className="card-club-logo" />
                        <div className='card-club-title-container'>
                            <span className='card-club-name'>{name}</span>
                            <div className='card-club-followed-match-container'>
                                <span className='card-club-joined'>{followed ? 'Joined' : ' '} </span>
                                {match && <span className={`card-club-match card-club-match-${matchColor}`}>Match: {match}%</span>}
                            </div>
                        </div>
                    </div>
                    <span className='card-club-desc'> {shortdesc}</span>
                </div>
                <div className='card-club-interests'>
                    {interests.map(item => <div className='card-club-interest'>
                        <Chip
                            variant="outlined"
                            color="primary"
                            size="sm"
                            sx={{ pointerEvents: 'none' }}
                        >
                            {item}
                        </Chip>
                    </div>)}
                </div>
            </CardContent>
        </Card>
    );
}
