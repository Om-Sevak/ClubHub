import sendRequest from "./client";

const interestsApi = {
  getAllInterests: async () => sendRequest('GET', `interest`),
  getClubInterests: async (clubName) => sendRequest('GET', `interest/${clubName}`)
};

// Club API functions
export default interestsApi;