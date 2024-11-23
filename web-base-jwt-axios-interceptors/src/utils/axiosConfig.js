import axios from "axios";
import { API_ROOT } from "./constants";
import { logoutApi, refreshTokenApi } from "~/apis";
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

let holdPromiseRefreshToken = null;
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    //LOGOUT: Error
    if (error.response.status === 401) {
      logoutApi()
        .then(() => {
          location.href = "/login";
        })
        .catch((error) => {
          return Promise.reject(error);
        });

      return Promise.reject(error);
    }
    const originRequest = error.config;

    // 410 Refresh Token
    if (error.response.status === 410 && originRequest) {
      if (!holdPromiseRefreshToken) {
        const refreshToken = JSON.parse(localStorage.getItem("refreshToken"));
        holdPromiseRefreshToken = refreshTokenApi(refreshToken)
          .then((response) => {
            const { accessToken } = response.data.data;
            localStorage.setItem("accessToken", JSON.stringify(accessToken));
            axiosInstance.defaults.headers[
              "Authorization"
            ] = `Bearer ${accessToken}`;
          })
          .catch((error) => {
            logoutApi()
              .then(() => {
                location.href = "/login";
              })
              .catch((error) => {
                return Promise.reject(error);
              });

            return Promise.reject(error);
          })
          .finally(() => {
            holdPromiseRefreshToken = null;
          });
      }
      return holdPromiseRefreshToken.then(() => {
        return axiosInstance(originRequest);
      });
    }

    if (error.response.status !== 410) {
      const errorMessage = error?.response?.data?.message || error?.message;
      return Promise.reject(errorMessage);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
