import sendRequest from "./client";

const authApi = {
    // Auth API functions
    login: async (userData) => sendRequest('POST', 'login', userData)
};

export default authApi;