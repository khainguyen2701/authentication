import axios from "axios";
import { API_ROOT } from "./constants";
let axiosInstance = axios.create({
  baseURL: API_ROOT,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 1000 * 60 * 10,

  withCredentials: true //HTTP ONLY COOKIE,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = JSON.parse(localStorage.getItem("accessToken"));
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status !== 410) {
      const errorMessage = error?.response?.data?.message || error?.message;
      return Promise.reject(errorMessage);
    }
  }
);

export default axiosInstance;
