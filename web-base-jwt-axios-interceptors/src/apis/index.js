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

export const get2FA_QRCode = async (id) => {
  return await axiosInstance.get(`/v1/users/${id}/get_2fa_qr_code`);
};

export const setup2FA = async (id, otpToken) => {
  return await axiosInstance.post(`/v1/users/${id}/setup_2fa`, {
    otpToken
  });
};
