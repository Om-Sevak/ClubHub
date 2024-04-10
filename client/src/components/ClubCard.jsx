/*********************************************************************************
	FileName: ClubCard.jsx
	FileVersion: 1.0
	Core Feature(s): Display club information and interests, handle click events for navigation
	Purpose: This component renders a card representing a club. It displays the club's name, description, logo, followed status, match percentage, and interests. It also handles click events to navigate to a specific club page.
*********************************************************************************/

import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Chip from '@mui/joy/Chip';
import './ClubCard.css'
import { useNavigate } from 'react-router-dom';

const DESC_LIMIT = 150;

export default function ClubCard({ name, desc, img, followed, interests, match }) {
    const navigate = useNavigate();

    let shortDesc = "";
    if (desc) {
        if (desc.length > DESC_LIMIT) {
            const shortenedLine = desc.substring(0, DESC_LIMIT);
            const lastSpace = shortenedLine.lastIndexOf(" ");
            shortDesc = `${shortenedLine.substring(0, lastSpace)}...`;
        } else {
            shortDesc = desc;
        }
    }
    // Determine the color based on match percentage
    let matchColor;
    if (match >= 80) {
        matchColor = 'green';
    } else if (match >= 40) {
        matchColor = 'orange';
    } else {
        matchColor = 'red';
    }

    let matchExists = false;
    if (match >= 0){
        matchExists = true;
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
                '&:hover': { boxShadow: 'xl', borderColor: 'black' },
            }}
            onClick={handleCardClick}
            style={{backgroundColor: "white"}}
        >
            <CardContent>
                <div className='card-club-content'>
                    <div className='card-club-top'>
                        <img src={img} alt="Company Logo" className="card-club-logo" />
                        <div className='card-club-title-container'>
                            <span className='card-club-name'>{name}</span>
                            <div className='card-club-followed-match-container'>
                                <span className='card-club-joined'>{followed ? 'Joined' : ' '} </span>
                                {matchExists && <span className={`card-club-match card-club-match-${matchColor}`}>Match: {match}%</span>}
                            </div>
                        </div>
                    </div>
                    <span className='card-club-desc'> {shortDesc}</span>
                </div>
                <div className='card-club-interests'>
                    {interests.map((item, key) =>  {return (<div className='card-club-interest' key={key}>
                        <Chip
                            variant="outlined"
                            color="primary"
                            size="sm"
                            sx={{ pointerEvents: 'none' }}
                        >
                            {item}
                        </Chip>
                    </div>)})}
                </div>
            </CardContent>
        </Card>
    );
}
