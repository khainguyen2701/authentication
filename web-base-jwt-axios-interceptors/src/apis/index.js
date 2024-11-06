import axiosInstance from "~/utils/axiosConfig";

export const logoutApi = async () => {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return await axiosInstance.delete("/v1/users/logout");
};
export const refreshTokenApi = async (refreshToken) => {
  return await axiosInstance.put("/v1/users/refresh_token", {
    refreshToken
  });
};
