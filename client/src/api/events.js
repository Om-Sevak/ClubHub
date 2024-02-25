import sendRequest from "./client";

const eventApi = {
  getAllEvents: async () => sendRequest('GET', 'event'),
  getEventsForClub: async (clubName) => sendRequest('GET', `club/${clubName}/event`),
  createEvent: async (eventData, clubName) => sendRequest('POST', `club/${clubName}/event`, eventData),
  updateEvent: async (eventId, clubName, eventData) => sendRequest('PUT', `club/${clubName}/event/${eventId}`, eventData),
  deleteEvent: async (eventId, clubName) => sendRequest('DELETE', `club/${clubName}/event/${eventId}`),
};

export default eventApi;
