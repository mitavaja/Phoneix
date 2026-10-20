import axios from "axios";

export const API_ROOT = (import.meta.env.VITE_API_URL || "https://api.phreights.com/api").replace(/\/+$/, "");
export const resolveAssetUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  const origin = API_ROOT.replace(/\/api\/?$/, "");
  return origin + (url.startsWith("/") ? url : "/" + url);
};

const API = axios.create({
  baseURL: API_ROOT,
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

// Auto-logout on 401 Unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or invalid token. Auto-logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("jwt");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
