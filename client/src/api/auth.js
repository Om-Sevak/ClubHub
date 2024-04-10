/*********************************************************************************
    FileName: auth.js
    FileVersion: 1.0
    Core Feature(s): User Authentication, Registration, Session Management, Password Change
    Purpose: This file defines an API object for handling authentication-related HTTP requests. It includes functions for user login, logout, registration, checking login status, and changing passwords. These functionalities are essential for managing user authentication and ensuring secure access to the application.
*********************************************************************************/


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