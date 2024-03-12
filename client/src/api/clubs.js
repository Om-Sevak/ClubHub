import sendRequest from "./client";

const clubApi = {
  getClubs: async (query) => sendRequest('GET', `club/clubs/${query}`),
  getClub: async (clubName) => sendRequest('GET', `club/${clubName}`),
  getClubsBrowse: async (queryData) => sendRequest('POST', `club/clubs/browse`, queryData),
  createClub: async (clubData) => sendRequest('POST', 'club', clubData),
  editClub: async (clubName, clubData) => sendRequest('PUT', `club/${clubName}`, clubData),
  deleteClub: async (clubName) => sendRequest('DELETE', `club/${clubName}`),
};

// Club API functions
export default clubApi;