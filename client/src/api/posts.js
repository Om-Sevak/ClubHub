import sendRequest from "./client";

const postApi = {
  createPost: async (postData, clubName) => sendRequest('POST', `club/${clubName}/post`, postData),
  getPostsForClub: async (clubName) => sendRequest('GET', `club/${clubName}/post`)
};

export default postApi;