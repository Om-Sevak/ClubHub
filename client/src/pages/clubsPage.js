import { React, useEffect, useState } from 'react';
import Header from '../components/Header';
import Grid from '@mui/material/Grid';
import ClubCard from '../components/ClubCard';
import clubApi from '../api/clubs';
import Pagination from '@mui/material/Pagination'; 
import './clubsPage.css';

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const clubsPerPage = 12; // Adjust this value as needed

  useEffect(() => {
    const fetchData = async () => {
      try {
        const body = {
          "includeJoined": true,
          "limit": 100,
        }
        const { status: reqStatus, data: reqData } = await clubApi.getClubsBrowse(body);
        if (reqStatus === 200) {
          setClubs(reqData.clubs);
          setPageCount(Math.ceil(reqData.clubs.length / clubsPerPage));
        } else {
          throw new Error("Server Error");
        }
      } catch (error) {
        console.error('Interest Error', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (event, newPage) => {
    setPage(newPage);
  };

  const displayedClubs = clubs.slice((page - 1) * clubsPerPage, page * clubsPerPage);

  return (
    <div className='clubsPage'>
      <Header />
      <div className='clubsPage-container'>
        <div className='clubsPage-title'>
          <h1 id='clubsPage-title'>Discover Clubs</h1>
        </div>

        <div className='clubsPage-clubs'>
          <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 'auto', sm: 'auto', md: 'auto' }}>
            {displayedClubs.map((club, index) => (
              <Grid item key={index}>
                 <ClubCard 
                    name={club.name} 
                    desc={club.description}
                    img={club.imgUrl}
                    interests={club.interests}
                    followed={club.isJoined}
                 />
              </Grid>
            ))}
          </Grid>

        </div>

        <Pagination 
          count={pageCount} 
          className='pagination'
          color='primary'
          page={page} 
          onChange={handleChange}
          sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }} // Center the pagination
        />

      </div>
    </div>
  );
};

export default ClubsPage;
