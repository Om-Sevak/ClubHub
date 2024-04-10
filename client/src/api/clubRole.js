/*********************************************************************************
    FileName: clubRole.js
    FileVersion: 1.0
    Core Feature(s): HTTP Request Handling
    Purpose: This file provides API functions for managing club roles. It includes functions to retrieve club roles, create new club roles, and delete existing club roles by sending requests to the appropriate endpoints using the `sendRequest` function imported from the client module.
*********************************************************************************/

import sendRequest from "./client";

const clubRoleApi = {
  getClubRole: async (clubName) => sendRequest('GET', `role/${clubName}`),
  createClubRole: async (clubName, roleData) => sendRequest('POST', `role/${clubName}`, roleData),
  deleteClubRole: async (clubName) => sendRequest('DELETE', `role/${clubName}`)
};

// Club API functions
export default clubRoleApi;