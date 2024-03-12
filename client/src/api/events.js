import sendRequest from "./client";

const eventApi = {
  getAllEvents: async () => sendRequest('GET', 'club/events'),
  getEventsForClub: async (clubName) => sendRequest('GET', `club/${clubName}/event`),
  getEvent: async (clubName, eventId) => sendRequest('GET', `club/${clubName}/event/${eventId}`),
  createEvent: async (eventData, clubName) => sendRequest('POST', `club/${clubName}/event`, eventData),
  editEvent: async (clubName, eventId, eventData) => sendRequest('PUT', `club/${clubName}/event/${eventId}`, eventData),
  deleteEvent: async (clubName, eventId) => sendRequest('DELETE', `club/${clubName}/event/${eventId}`),
};

export default eventApi;
