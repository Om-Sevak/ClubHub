import sendRequest from "./client";

const authApi = {
    // Auth API functions
    login: async (userData) => sendRequest('POST', 'login', userData),
    logout: async () => sendRequest('POST', 'auth/logout'),
    register: async (userData) => sendRequest('PUT', 'register', userData),
    loginStatus: async () => sendRequest('GET', `auth/loginStatus`),
    changePassword: async (userData) => sendRequest('POST', 'auth/changePassword', userData),
};

export default authApi;