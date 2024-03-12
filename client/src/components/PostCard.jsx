import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import logoIMG from '../assets/logoIMG.jpeg'
import './PostCard.css'
import { useNavigate } from 'react-router-dom';

const DESC_LIMIT = 500;

export default function PostCard({ clubname, postname, postId, contents, isAdmin, img, dateString }) {
    const navigate = useNavigate();

    const shortdesc = contents ? (contents.length > DESC_LIMIT ? `${contents.substring(0, DESC_LIMIT)} . . .` : contents) : "";
    const formatedDate = (new Date(dateString)).toDateString();

    const handleCardClick = () => {
        //navigate to single post page
    }

    return (
        <Card
            variant="outlined"
            orientation="horizontal"
            sx={{
                width: 300,
                height: 400,
                '&:hover': { boxShadow: 'xl', borderColor: 'black' },
            }}
            onClick={handleCardClick}
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
                </div>
            </CardContent>
        </Card>
    );
}