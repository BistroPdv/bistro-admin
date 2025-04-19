import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL_API,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Erro na resposta:", error.response.data);

      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    } else if (error.request) {
      console.error("Erro na requisição:", error.request);
    } else {
      console.error("Erro:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
