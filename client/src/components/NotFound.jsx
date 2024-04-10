/*********************************************************************************
  FileName: NotFound.jsx
  FileVersion: 1.0
  Core Feature(s): Displaying a 404 Not Found message
  Purpose: This component renders a message indicating that the requested page does not exist.
*********************************************************************************/

import React from 'react';

function NotFound() {
  return (
    <div>
      <h2>404 Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}

export default NotFound;