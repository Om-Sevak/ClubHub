```javascript
/*********************************************************************************
    FileName: index.js
    FileVersion: 1.0
    Core Feature(s): Routing, Rendering
    Purpose: This file serves as the entry point for the application. It renders the root component of the application using ReactDOM. The root component is wrapped inside a Router component from react-router-dom to enable client-side routing. The Routes component is used to define the routing configuration for different paths in the application. Each route is mapped to a specific page component, which is rendered when the corresponding URL is accessed. The ToastProvider component is used to provide toast notifications context to the entire application.
*********************************************************************************/
```

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
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
