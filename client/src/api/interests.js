import sendRequest from "./client";

const interestsApi = {
  getAllInterests: async () => sendRequest('GET', `interest`),
};

// Club API functions
export default interestsApi;