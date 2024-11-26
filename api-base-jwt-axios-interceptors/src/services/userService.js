import { pick } from "lodash";
import {
  detailUserModel,
  get2FA_QRCode_Model,
  loginModel,
  setup2FA_Model
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

export const setup2FA_Service = async ({ id, clientOtpToken, userAgent }) => {
  try {
    const twoFA = await setup2FA_Model({ id, clientOtpToken, userAgent });
    let pickUser = null;
    pickUser = pick(twoFA, [
      "_id",
      "email",
      "enable_2fa",
      "is_2fa_verified",
      "last_login",
      "device_id"
    ]);
    pickUser.id = pickUser._id;
    return pickUser;
  } catch (error) {
    throw error;
  }
};
