import axios from "axios";

// Base URL configuration
// In development we fall back to a localhost URL. In production the environment variable VITE_API_URL must be provided.
const baseURL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://cc-beauty-system.onrender.com/api");

// Enforce mandatory VITE_API_URL in production builds (Vite sets import.meta.env.PROD)
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  throw new Error("VITE_API_URL environment variable is required in production");
}

const api = axios.create({
  baseURL: baseURL,
  timeout: 60000, // 60 seconds
  // Default headers – JSON API
  headers: { "Content-Type": "application/json" },
  // TODO: add CSRF token header here if your backend requires it
});

// Detailed error logging interceptor (kept for debugging, but no console.log of base URL)
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

// Request interceptor – attach auth token if present
api.interceptors.request.use((config) => {
  // Prefer sessionStorage (tab‑specific) first, then fallback to localStorage (persistent)
  let storedUser = sessionStorage.getItem("userInfo");

  if (!storedUser) {
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
