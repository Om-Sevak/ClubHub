import sendRequest from "./client";

const eventApi = {
  getAllEvents: async () => sendRequest('GET', 'event'),
  getEventsForClub: async (clubId) => sendRequest('GET', `event?club=${clubId}`),
  createEvent: async (eventData) => sendRequest('POST', 'event', eventData),
  updateEvent: async (eventId, eventData) => sendRequest('PUT', `event/${eventId}`, eventData),
  deleteEvent: async (eventId) => sendRequest('DELETE', `event/${eventId}`),
};

export default eventApi;
