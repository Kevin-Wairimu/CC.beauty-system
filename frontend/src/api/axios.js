import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://cc-beauty-system.onrender.com/api");

console.log("API Base URL:", baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 60000, // 60 seconds
});

// Detailed error logging interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorInfo = {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    };
    console.error("Axios Detail:", errorInfo);
    return Promise.reject(error);
  }
);

// Add a request interceptor to include the token in headers
api.interceptors.request.use((config) => {
  // Check sessionStorage (tab-specific) first
  let storedUser = sessionStorage.getItem("userInfo");

  if (!storedUser) {
    // Fallback to localStorage (persistent) for new tabs
    storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      // Pin it to this tab's session so future changes in other tabs don't affect this one
      sessionStorage.setItem("userInfo", storedUser);
    }
  }

  const user = storedUser ? JSON.parse(storedUser) : null;

  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
