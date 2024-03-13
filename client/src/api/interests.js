import sendRequest from "./client";

const interestsApi = {
  getAllInterests: async () => sendRequest('GET', `interest`),
  getClubInterests: async (clubName) => sendRequest('GET', `interest/${clubName}`),
  getUserInterests: async (userName) => sendRequest('GET', `interest/user/${userName}`),
  editUserInterests: async (newInterests) => sendRequest('POST', `interest/save`, { interests: newInterests }),

};

// Club API functions
export default interestsApi;