import sendRequest from "./client";

const postApi = {
  createPost: async (postData, clubName) => sendRequest('POST', `club/${clubName}/post`, postData),
  getPostsBrowse: async (queryData) => sendRequest('POST', `club/posts/browse`, queryData),
  getPostsForClub: async (clubName) => sendRequest('GET', `club/${clubName}/post`),
  getPost: async (clubName, postId) => sendRequest('GET', `club/${clubName}/post/${postId}`),
  editPost: async (clubName, postId, postData) => sendRequest('PUT', `club/${clubName}/post/${postId}`, postData),
  deletePost: async (clubName, postId) => sendRequest('DELETE', `club/${clubName}/post/${postId}`),
};

export default postApi;