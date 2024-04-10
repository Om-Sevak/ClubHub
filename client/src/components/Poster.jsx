/*********************************************************************************
  FileName: Poster.jsx
  FileVersion: 1.0
  Core Feature(s): Displaying a poster image
  Purpose: This component renders a poster image in full size, centered on the screen.
*********************************************************************************/


import React from 'react';

const Poster = ({ imageUrl }) => {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img src={imageUrl} alt="Full Size" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </div>
  );
};

export default Poster;