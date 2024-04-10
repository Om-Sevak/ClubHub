/*********************************************************************************
    FileName: posts.js
    FileVersion: 1.0
    Core Feature(s): HTTP Request Handling
    Purpose: This file provides API functions for interacting with post-related endpoints. It includes functions to create a post within a specific club, retrieve posts for a club, retrieve a specific post within a club, edit a post within a club, and delete a post within a club. These functions utilize the `sendRequest` function imported from the client module to make HTTP requests to the corresponding endpoints.
*********************************************************************************/

import sendRequest from "./client";

const postApi = {
  createPost: async (postData, clubName) => sendRequest('POST', `post/${clubName}`, postData),
  getPostsBrowse: async (queryData) => sendRequest('POST', `post/browse`, queryData),
  getPostsForClub: async (clubName) => sendRequest('GET', `post/${clubName}`),
  getPost: async (clubName, postId) => sendRequest('GET', `post/${clubName}/${postId}`),
  editPost: async (clubName, postId, postData) => sendRequest('PUT', `post/${clubName}/${postId}`, postData),
  deletePost: async (clubName, postId) => sendRequest('DELETE', `post/${clubName}/${postId}`),
};

export default postApi;