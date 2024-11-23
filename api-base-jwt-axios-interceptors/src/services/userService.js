import {
  detailUserModel,
  get2FA_QRCode_Model,
  loginModel
} from "~/models/userModels";

/* eslint-disable no-useless-catch */
export const loginService = async ({ email, password }) => {
  try {
    const user = await loginModel({ email, password });
    return user;
  } catch (error) {
    throw error;
  }
};

export const detailUserService = async ({ id }) => {
  try {
    const profile = await detailUserModel({ id });
    return profile;
  } catch (error) {
    throw error;
  }
};

export const get2FA_QRCode_Service = async ({ id }) => {
  try {
    const twoFA = await get2FA_QRCode_Model({ id });
    return twoFA;
  } catch (error) {
    throw error;
  }
};
