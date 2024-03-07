import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import logoIMG from '../assets/logoIMG.jpeg'
import './PostCard.css'
import { useNavigate } from 'react-router-dom';

const DESC_LIMIT = 500;

export default function PostCard({ clubname, postname, desc }) {
    const navigate = useNavigate();

    const shortdesc = desc.length > DESC_LIMIT ? `${desc.substring(0, DESC_LIMIT)} . . .` : desc;


    const handleCardClick = () => {
        //navigate to single post page
        window.location.reload();
    }

    return (
        <Card
            variant="outlined"
            orientation="horizontal"
            sx={{
                width: 300,
                height: 400,
                '&:hover': { boxShadow: 'xl', borderColor: 'neutral.outlinedHoverBorder' },
            }}
            onClick={handleCardClick}
        >
            <CardContent>
                <div className='card-post-content'>
                    <div className='card-post-top'>
                        <img src={logoIMG} alt="Company Logo" className="card-post-logo" />
                        <div className='card-post-title-container'>
                            <span className='card-post-name'> {postname} </span>
                        </div>
                    </div>
                    <span className='card-post-club-name'> Post from {clubname}:</span>
                    <span className='card-post-desc'> {shortdesc}</span>
                </div>
            </CardContent>
        </Card>
    );
}