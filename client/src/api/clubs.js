import sendRequest from "./client";

const clubApi = {
  getClubs: async () => sendRequest('GET', 'club'),
  getClub: async (clubName) => sendRequest('GET', `club/${clubName}`),
  createClub: async (clubData) => sendRequest('POST', 'club', clubData),
  updateClub: async (clubName, clubData) => sendRequest('PUT', `club/${clubName}`, clubData),
  deleteClub: async (clubName) => sendRequest('DELETE', `club/${clubName}`),
};

// Club API functions
export default clubApi;