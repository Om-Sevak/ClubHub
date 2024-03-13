import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import reportWebVitals from './reportWebVitals';
import ClubCreatePage from './pages/createClubPage';
import ClubPage from './pages/clubPage';
import EventCreatePage from './pages/createEventPage';
import EditClubPage from './pages/editClubPage';
import HomePage from './pages/homePage';
import ClubsPage from './pages/clubsPage';
import EventsPage from './pages/eventsPage';
import FindClubPage from './pages/findClubPage';
import SingleEventPage from './pages/singleEventPage';
import EditEventPage from './pages/editEventPage';
import PostCreatePage from './pages/createPostPage';

import { ToastProvider } from './components/ToastContext';
import EditPostPage from './pages/editPostPage';
import PosterPage from './pages/PosterPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
    <ToastProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/homePage" element={<HomePage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/findClub" element={<FindClubPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path="/App" element={<App />} />
        <Route path="/createClub" element={<ClubCreatePage />} />
        <Route path="/club/:clubName" element={<ClubPage />} />
        <Route path="/club/edit/:clubName" element={<EditClubPage />} />
        <Route path="/club/createEvent/:clubName" element={<EventCreatePage />} />
        <Route path="/club/:clubName/event/:eventId" element={<SingleEventPage />} />
        <Route path="/club/:clubName/event/edit/:eventId" element={<EditEventPage />} />
        <Route path="/club/createPost/:clubName" element={<PostCreatePage />} />
        <Route path="/club/:clubName/post/:postId" element={<PosterPage />} />
        <Route path="/club/:clubName/post/edit/:postId" element={<EditPostPage />} />
        
      </Routes>
     </ToastProvider>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
