import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Auto-attach authorization token from localStorage to all outgoing API requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;