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
