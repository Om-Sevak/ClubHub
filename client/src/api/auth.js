import sendRequest from "./client";

const authApi = {
    // Auth API functions
    login: async (userData) => sendRequest('POST', 'login', userData),
    register: async (userData) => sendRequest('POST', 'register', userData),
};

export default authApi;