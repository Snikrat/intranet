import axios from "axios";
import { API_URL } from "../config/env";
import { TOKEN_KEY, AUTH_MESSAGE_KEY } from "./auth";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 🔴 remove token
      localStorage.removeItem(TOKEN_KEY);

      // 🔴 salva mensagem pra mostrar no login
      localStorage.setItem(
        AUTH_MESSAGE_KEY,
        "Sessão expirada, faça login novamente.",
      );

      // 🔴 redireciona
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
