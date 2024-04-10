/*********************************************************************************
    FileName: clubs.js
    FileVersion: 1.0
    Core Feature(s): HTTP Request Handling
    Purpose: This file provides API functions for interacting with club-related endpoints. It includes functions to retrieve clubs, retrieve a specific club, browse clubs, create a new club, edit an existing club, and delete a club. These functions utilize the `sendRequest` function imported from the client module to make HTTP requests to the corresponding endpoints.
*********************************************************************************/

import sendRequest from "./client";

const clubApi = {
  getClubs: async (query) => sendRequest('GET', `club/clubs/${query}`),
  getClub: async (clubName) => sendRequest('GET', `club/${clubName}`),
  getClubsBrowse: async (queryData) => sendRequest('POST', `club/browse`, queryData),
  createClub: async (clubData) => sendRequest('POST', 'club', clubData),
  editClub: async (clubName, clubData) => sendRequest('PUT', `club/${clubName}`, clubData),
  deleteClub: async (clubName) => sendRequest('DELETE', `club/${clubName}`),
};

// Club API functions
export default clubApi;