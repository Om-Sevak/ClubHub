import sendRequest from "./client";

const clubRoleApi = {
  getClubRole: async (clubName) => sendRequest('GET', `role/${clubName}`),
  createClubRole: async (clubName, roleData) => sendRequest('POST', `role/${clubName}`, roleData),
  deleteClubRole: async (clubName) => sendRequest('DELETE', `role/${clubName}`)
};

// Club API functions
export default clubRoleApi;