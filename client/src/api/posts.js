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