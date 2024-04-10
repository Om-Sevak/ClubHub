/*********************************************************************************
    FileName: interests.js
    FileVersion: 1.0
    Core Feature(s): HTTP Request Handling
    Purpose: This file provides API functions for interacting with interest-related endpoints. It includes functions to retrieve all interests, retrieve interests associated with a specific club, retrieve interests associated with a specific user, and edit interests for a user. These functions utilize the `sendRequest` function imported from the client module to make HTTP requests to the corresponding endpoints.
*********************************************************************************/

import sendRequest from "./client";

const interestsApi = {
  getAllInterests: async () => sendRequest('GET', `interest`),
  getClubInterests: async (clubName) => sendRequest('GET', `interest/${clubName}`),
  getUserInterests: async (userName) => sendRequest('GET', `interest/user/${userName}`),
  editUserInterests: async (newInterests) => sendRequest('POST', `interest/save`, { interests: newInterests }),

};

// Club API functions
export default interestsApi;