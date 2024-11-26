import { pick } from "lodash";
import {
  detailUserModel,
  get2FA_QRCode_Model,
  loginModel,
  logoutModel,
  setup2FA_Model,
  verify2FA_Model
} from "~/models/userModels";

/* eslint-disable no-useless-catch */
export const loginService = async ({ email, password, deviceId }) => {
  try {
    const user = await loginModel({ email, password, deviceId });
    return user;
  } catch (error) {
    throw error;
  }
};

export const logoutService = async ({ id, deviceId }) => {
  try {
    const user = await logoutModel({ id, deviceId });
    return user;
  } catch (error) {
    throw error;
  }
};

export const detailUserService = async ({ id, deviceId }) => {
  try {
    const profile = await detailUserModel({ id, deviceId });
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
    const pickUser = pick(twoFA, ["_id", "email", "enable_2fa"]);
    const pickSections = pick(twoFA.section, [
      "is_2fa_verified",
      "last_login",
      "device_id"
    ]);
    return { ...pickUser, ...pickSections };
  } catch (error) {
    throw error;
  }
};

export const verify2FA_Service = async ({ id, clientOtpToken, userAgent }) => {
  try {
    const twoFA = await verify2FA_Model({ id, clientOtpToken, userAgent });
    const pickUser = pick(twoFA, ["_id", "email", "enable_2fa"]);
    const pickSections = pick(twoFA.section, [
      "is_2fa_verified",
      "last_login",
      "device_id"
    ]);
    return { ...pickUser, ...pickSections };
  } catch (error) {
    throw error;
  }
};
