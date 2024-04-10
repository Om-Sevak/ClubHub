/*********************************************************************************
    FileName: events.js
    FileVersion: 1.0
    Core Feature(s): HTTP Request Handling
    Purpose: This file provides API functions for interacting with event-related endpoints. It includes functions to retrieve all events, retrieve events for a specific club, retrieve a specific event, browse events, retrieve events for a specific user, create a new event, edit an existing event, and delete an event. These functions utilize the `sendRequest` function imported from the client module to make HTTP requests to the corresponding endpoints.
*********************************************************************************/

import sendRequest from "./client";

const eventApi = {
  getAllEvents: async () => sendRequest('GET', 'event/'),
  getEventsForClub: async (clubName) => sendRequest('GET', `event/${clubName}`),
  getEvent: async (clubName, eventId) => sendRequest('GET', `event/${clubName}/${eventId}`),
  getEventsBrowse: async (queryData) => sendRequest('POST', `event/browse`, queryData),
  getUserEvents: async (userName) => sendRequest('GET', `event/user/${userName}`),
  createEvent: async (eventData, clubName) => sendRequest('POST', `event/${clubName}`, eventData),
  editEvent: async (clubName, eventId, eventData) => sendRequest('PUT', `event/${clubName}/${eventId}`, eventData),
  deleteEvent: async (clubName, eventId) => sendRequest('DELETE', `event/${clubName}/${eventId}`),
};

export default eventApi;
