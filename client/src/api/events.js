import sendRequest from "./client";

const eventApi = {
  getAllEvents: async () => sendRequest('GET', 'event'),
  getEventsForClub: async (clubName) => sendRequest('GET', `club/club=${clubName}/event`),
  createEvent: async (eventData, clubName) => sendRequest('POST', `club/club=${clubName}/event`, eventData),
  updateEvent: async (eventId, clubName, eventData) => sendRequest('PUT', `club/club=${clubName}/event/event=${eventId}`, eventData),
  deleteEvent: async (eventId, clubName) => sendRequest('DELETE', `club/club=${clubName}/event/event=${eventId}`),
};

export default eventApi;
