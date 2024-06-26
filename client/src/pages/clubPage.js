/*********************************************************************************
    FileName: clubPage.js
    FileVersion: 1.0
    Core Feature(s): Club Page UI and Logic
    Purpose: This file defines the ClubPage component, which displays information about a specific club, including its description, events, posts, and contact details. It allows users to join or leave the club, create events or posts (if they are admins), and edit or delete the club (if they are admins). The component also handles fetching data from APIs and error handling.
*********************************************************************************/


import React, { useEffect, useState } from 'react';
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import './clubPage.css';
import { useParams } from 'react-router-dom';
import clubApi from '../api/clubs';
import clubRoleApi from '../api/clubRole';
import NotFound from '../components/NotFound';
import eventApi from '../api/events';
import postApi from '../api/posts';
import interestsApi from '../api/interests';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import EventCard from '../components/EventCard';
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import PostCard from '../components/PostCard';
import ConfirmationPopup from '../components/ConfirmationPopup';
import { useToast } from '../components/ToastContext';

// Header component
const ClubPage = () => {
  const { clubName } = useParams();
  const [clubDescription, setClubDescription] = useState('');
  const [clubEmail, setClubEmail] = useState('');
  const [clubInterests, setClubInterests] = useState([]);
  const [clubImage, setClubImage] = useState('');
  const [clubExecutives, setClubExecutives] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clubEvents, setClubEvents] = useState([])
  const [clubPosts, setClubPosts] = useState([])
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const { showToast } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const { status: reqStatus, data: clubData } = await clubApi.getClub(clubName);

        if (reqStatus === 200) {
          setClubDescription(clubData.description);
          setClubExecutives(clubData.executives);
          setClubEmail(clubData.email);
          setClubImage(clubData.imgUrl);
        }
        else if (reqStatus === 404) {
          setErrorMessage("Club does not exist")
        }
      }
      catch (error) {
        console.error('unable to get club ', error);
        setErrorMessage('Club does not exist');
      }
    };

    const fetchUserRoleData = async () => {
      try {
        const { status: reqStatus, data: roleData } = await clubRoleApi.getClubRole(clubName);

        // TODO: handle the case where data.role is admin
        if (reqStatus === 200) {
          setIsMember(true);
          if (roleData.data.role === "admin") {
            setIsAdmin(true);
          }
          else {
            setIsAdmin(false);
          }
        }
        else if (reqStatus === 404) {
          setIsMember(false);
          setIsAdmin(false);
        }
      }
      catch (error) {
        console.error('there was an error getting the role ', error);
      }
    };

    const fetchClubEvents = async () => {

      try {
        
        const { status: reqStatus, data: eventData } = await eventApi.getEventsForClub(clubName);
        if (reqStatus === 200) {
          setClubEvents(eventData.events);
        }
        else if (reqStatus === 404) {
          setErrorMessage("Club does not exist")
        }
      }
      catch (error) {
        console.error('unable to get events ', error);
        setErrorMessage('Club does not exist');
      }
    };

    const fetchClubPosts = async () => {

      try {
        
        const { status: reqStatus, data: postData } = await postApi.getPostsForClub(clubName);
        if (reqStatus === 200) {
          setClubPosts(postData.posts);
        }
        else if (reqStatus === 404) {
          setErrorMessage("Club does not exist")
        }
      }
      catch (error) {
        console.error('unable to get posts ', error);
        setErrorMessage('Club does not exist');
      }
    };

    const fetchClubInterests = async () => {
      try {
        const { status: reqStatus, data: interestData } = await interestsApi.getClubInterests(clubName);
        if (reqStatus === 200) {
          const interests = interestData.interests;
          setClubInterests(interests);
        }
        else if (reqStatus === 404) {
          setErrorMessage("Club does not exist")
        }
      }
      catch (error) {
        console.error('unable to get interests ', error);
        setErrorMessage('Club does not exist');
      }
    };
    
    fetchClubData();
    fetchUserRoleData();
    fetchClubEvents();
    fetchClubPosts();
    fetchClubInterests();

  }, [])

  const handleJoin = async () => {
    try {
      const response = await clubRoleApi.createClubRole(clubName, { role: "member" });
      if (response.status === 200) {
        //window.location.reload();
        setIsMember(true);
        showToast('Joined ' + clubName + '!');
      } else if (response.status === 400) {
        setErrorMessage(response.error);
      }
      else if (response.status === 403) {
        setErrorMessage('You must be signed in to join a club');
      }
    } catch (error) {
      console.error('failed to join club ', error);

    }
  }

  const handleLeave = async () => {
    try {
      const response = await clubRoleApi.deleteClubRole(clubName);
      if (response.status === 200) {
        //window.location.reload();
        setIsMember(false);
        showToast('Left ' + clubName + '!');
      } else if (response.status === 400) {
        setErrorMessage(response.error);
      }
      else if (response.status === 403) {
        setErrorMessage('You must be signed in to leave a club');
      }
    } catch (error) {
      console.error('failed to leave the club ', error);

    }
  }
  const handleEdit = async() => {
    navigate(`/club/edit/${clubName}`);
  }

  const handleDelete = async () => {
    setShowConfirmationPopup(true);
  }
  
  const confirmDelete = async () => {
    try {
        const response = await clubApi.deleteClub(clubName);
        if (response.status === 200) {
            navigate(`/`);
            showToast( clubName + 'deleted successfully');
        } else if (response.status === 403) {
            setErrorMessage('Only an admin can delete the club');
        } else if (response.status === 404) {
            setErrorMessage('club not found');
        }
    } catch (error) {
        console.error('club deletion failed: ', error);
    }
    setShowConfirmationPopup(false);
  };

  const cancelDelete = () => {
      setShowConfirmationPopup(false); 
  };



  function Name_Header() {
    return (
      <header className='club-page-header'>
        <img src={clubImage} alt="Logo" className="clubLogo" /> 
        <h1 className='header-h1'>{clubName}</h1>
      </header>
    );
  }


  function About() {
    return (
      <section className="about" >
        <p>{clubDescription}</p>
        
        <div className="interests">
        
          {clubInterests.map((interest, index) => (
  
            <span key={index} className="interest">
              
              {interest}
              {index !== clubInterests.length - 1 && ','} {/* Add comma if not the last interest */}
            </span>
          ))}
        </div>
        <h2 className='header-h2'>Contact Us : <span className='club-email' >{clubEmail}</span></h2>
      </section>
    );
  }
  
  
  

  const handleCreateEventClick = () => {
    navigate(`/club/createEvent/${clubName}`);
  };

  // Events section component
  function Events() {

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toDateString();
    };

    const handleEventClick = (eventId) => {
      navigate(`/club/${clubName}/${eventId}`);
    }

    return (
      <section className="events" style={{ paddingBottom: isAdmin ? '65px' : '20px' }}>
        <h2>Upcoming Events</h2>
        <ul>
          {clubEvents.map(event => (
            <div key={event._id} style={{ marginBottom: '20px' }}>
              <EventCard
                event={event.title}
                eventId={event._id}
                name={clubName}
                isAdmin={isAdmin}
                dateString={event.date}
                img={clubImage}
              />
            </div>
          ))}
        </ul>
        {isAdmin &&
          <div className='add-event-icon' onClick={handleCreateEventClick}>
          <FontAwesomeIcon icon={faPlus}  />
          </div>}
      </section>
    );
  }

  const handleCreatePostClick = () => {
    navigate(`/club/createPost/${clubName}`);
  };

  function Posts() {

    return (
      <section className="posts" style={{ paddingBottom: isAdmin ? '65px' : '20px' }}>
        <h2>Latest Posts</h2>
        <ul>
          {clubPosts.map(post => (
            <div key={post._id} style={{ marginBottom: '20px' }}>
              <PostCard
                clubname={clubName}
                postname={post.title}
                postId={post._id}
                contents={post.content}
                isAdmin={isAdmin}
                dateString={post.date}
                isPoster={post.imgUrl}
                img={clubImage}
              />
            </div>
          ))}
        </ul>
        {isAdmin &&
          <div className='add-post-icon' onClick={handleCreatePostClick}>
          <FontAwesomeIcon icon={faPlus}  />
          </div>}
      </section>
    );
  }

  if (errorMessage === 'Club does not exist') {
    return <NotFound />;
  }

  return (
    <div className='club-page'>
      <Header />


      <div className='club-page-col'>

          <Name_Header />

          <main>
              <About />
              <div className='postsevents'>
                  <Events />
                  <Posts />

                  {isAdmin && <button onClick={handleEdit}>Edit Club</button>}
                  {isAdmin ? <button onClick={handleDelete}>Delete Club</button> : <button onClick={isMember ? handleLeave : handleJoin}>{isMember ? 'Leave Club' : 'Join Club'}</button>}
                  {errorMessage && <p className="error-message">{errorMessage}</p>}
              </div>
          </main>

      </div>


      {showConfirmationPopup && (
          <ConfirmationPopup
              message="Are you sure you want to delete this club?"
              onConfirm={confirmDelete}
              onCancel={cancelDelete}
          />
      )}
    </div>


  );
};

export default ClubPage;


