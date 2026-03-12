import axios from "axios";

const api = axios.create({
  baseURL: "https://cc-beauty-system.onrender.com/api",
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
