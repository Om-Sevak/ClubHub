import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL,
});

//  Interceptors for requests and responses
api.interceptors.request.use(
  (config) => {
    // Token will go here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Generic request function
// Generic request function
const sendRequest = async (method, endpoint, data = null) => {
  try {
    const response = await api({
      method,
      url: `/${endpoint}`,
      data,
    });

    // Return the response data and status
    return {
      data: response.data,
      status: response.status,
      error: null,
    };
  } catch (error) {
    // Extract error message from the server response
    const errorMessage = error.response ? error.response.data.message : error.message;
    
    // Return the error message along with status
    return {
      data: null,
      status: error.response ? error.response.status : null,
      error: errorMessage,
    };
  }
};


export default sendRequest;
