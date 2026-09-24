import axios from 'axios';

// Toggle between mock data and real backend server
// Toggle between mock data and real backend server
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'false';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for inserting JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agri_auth_token');
    const role = localStorage.getItem('agri_user_role');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `%c===== FRONTEND API REQUEST =====\nURL: ${config.baseURL || ''}${config.url}\nMethod: ${config.method?.toUpperCase()}\nToken present: ${!!token}\nRole: ${role}\n================================`,
      'color: #059669; font-weight: bold;'
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common error statuses gracefully without auto-logout
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `%c===== FRONTEND API RESPONSE =====\nURL: ${response.config?.url}\nStatus: ${response.status}\nSuccess: true\n=================================`,
      'color: #10b981; font-weight: bold;'
    );
    if (response?.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      return response.data.data !== undefined ? response.data.data : response.data;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status || 'Network Error';
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred while processing your request';

    console.warn(
      `%c===== FRONTEND API ERROR =====\nURL: ${error.config?.url}\nMethod: ${error.config?.method?.toUpperCase()}\nHTTP Status: ${status}\nError: ${errorMessage}\nToken in localStorage: ${!!localStorage.getItem('agri_auth_token')}\n==============================`,
      'color: #ef4444; font-weight: bold;'
    );

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;


// import axios from 'axios';

// // Toggle between mock data and real backend server
// export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'false';

// // const API_BASE_URL =
// //   import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000,
// });

// // Request interceptor for inserting JWT token
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('agri_auth_token');
//     const role = localStorage.getItem('agri_user_role');

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     console.log(
//       `%c===== FRONTEND API REQUEST =====\nURL: ${config.baseURL || ''}${config.url}\nMethod: ${config.method?.toUpperCase()}\nToken present: ${!!token}\nRole: ${role}\n================================`,
//       'color: #059669; font-weight: bold;'
//     );

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// apiClient.interceptors.response.use(
//   (response) => {
//     console.log(
//       `%c===== FRONTEND API RESPONSE =====\nURL: ${response.config?.url}\nStatus: ${response.status}\nSuccess: true\n=================================`,
//       'color: #10b981; font-weight: bold;'
//     );

//     if (
//       response?.data &&
//       typeof response.data === 'object' &&
//       'success' in response.data &&
//       'data' in response.data
//     ) {
//       return response.data.data !== undefined
//         ? response.data.data
//         : response.data;
//     }

//     return response.data;
//   },
//   (error) => {
//     const status = error.response?.status || 'Network Error';

//     const errorMessage =
//       error.response?.data?.message ||
//       error.response?.data?.error ||
//       error.message ||
//       'An error occurred while processing your request';

//     console.warn(
//       `%c===== FRONTEND API ERROR =====\nURL: ${error.config?.url}\nMethod: ${error.config?.method?.toUpperCase()}\nHTTP Status: ${status}\nError: ${errorMessage}\nToken in localStorage: ${!!localStorage.getItem('agri_auth_token')}\n==============================`,
//       'color: #ef4444; font-weight: bold;'
//     );

//     return Promise.reject(new Error(errorMessage));
//   }
// );

// export default apiClient;