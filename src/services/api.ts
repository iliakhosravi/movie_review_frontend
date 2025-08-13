// src/services/api.ts
import axios from "axios";

const enableLog =
  String(import.meta.env.VITE_API_LOG || "").toLowerCase() === "true";

// ---------- JSON SERVER (movies / comments / test users) ----------
export const api = axios.create({
  baseURL: import.meta.env.VITE_JSON_API_BASE || "http://localhost:4000",
  withCredentials: false,
  timeout: 15000,
});

// ---------- DJANGO BACKEND (real auth / admin) ----------
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_DJANGO_API_BASE || "http://localhost:8000",
  withCredentials: false, // turn true only if you rely on cookies+CSRF and configure CORS properly
  timeout: 20000,
});

// ---------- Authorization helper ----------
export const setAuthToken = (token?: string | null) => {
  if (token) {
    authApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete authApi.defaults.headers.common.Authorization;
  }
};

// ---------- Optional debug logging ----------
const attachLogging = (instance: typeof api, name: string) => {
  if (!enableLog) return;
  instance.interceptors.request.use(
    (config) => {
      const url = (config.baseURL || "") + (config.url || "");
      console.log(`[${name} req]`, (config.method || "GET").toUpperCase(), url);
      return config;
    },
    (error) => {
      console.error(`[${name} req error]`, error);
      return Promise.reject(error);
    }
  );
  instance.interceptors.response.use(
    (res) => {
      console.log(`[${name} res]`, res.status, res.config.url);
      return res;
    },
    (error) => {
      if (error.response) {
        console.error(
          `[${name} res error]`,
          error.response.status,
          error.config?.url,
          error.response?.data
        );
      } else {
        console.error(`[${name} net error]`, error.message);
      }
      return Promise.reject(error);
    }
  );
};

attachLogging(api, "JSON");
attachLogging(authApi, "DJANGO");
