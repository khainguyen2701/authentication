import { StatusCodes } from "http-status-codes";
import { pick } from "lodash";
import { ObjectId } from "mongodb";
import { getDbInstance } from "~/config/mongodb";
import ApiError from "~/until/apiError";
import { authenticator } from "otplib"; //random secret key
import qrCode from "qrcode";

export const loginModel = async ({ email, password }) => {
  try {
    const userDb = await getDbInstance().collection("users").findOne({
      email,
      password
    });
    if (!userDb) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Your email or password is incorrect!",
        []
      );
    }
    return userDb;
  } catch (error) {
    throw new Error(error);
  }
};

export const detailUserModel = async ({ id }) => {
  try {
    const idMongo = new ObjectId(id);
    const userDb = await getDbInstance().collection("users").findOne({
      _id: idMongo
    });
    if (!userDb) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Cannot find user",
        []
      );
    }
    const pickUser = pick(userDb, ["_id", "email", "enable_2fa"]);
    return pickUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const get2FA_QRCode_Model = async ({ id }) => {
  try {
    const idMongo = new ObjectId(id);
    const userDb = await getDbInstance().collection("users").findOne({
      _id: idMongo
    });
    if (!userDb) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Cannot find user",
        []
      );
    }
    let twoFASecretKey = null;
    const twoUserSecretKey = await getDbInstance()
      .collection("2fa_secret_key")
      .findOne({
        user_id: userDb._id
      });
    if (!twoUserSecretKey) {
      const newTwoFASecretKey = await getDbInstance()
        .collection("2fa_secret_key")
        .insertOne({
          user_id: userDb._id,
          value: authenticator.generateSecret()
        });
      twoFASecretKey = newTwoFASecretKey.value;
    } else {
      twoFASecretKey = twoUserSecretKey.value;
    }
    // create otp token
    const createOtpToken = authenticator.keyuri(userDb, "2FA", twoFASecretKey);

    // create QRCode from lib QRCODE

    const QRCodeImage = await qrCode.toDataURL(createOtpToken);
    return { qrCodeImage: QRCodeImage };
  } catch (error) {
    throw new Error(error);
  }
};
