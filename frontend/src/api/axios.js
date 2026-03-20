import axios from "axios";

// Automatically switch between Local and Production URLs
const baseURL = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" 
  ? "http://localhost:5000/api" 
  : "https://cc-beauty-system.onrender.com/api");

const api = axios.create({
  baseURL: baseURL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
