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
      const insertSecretKey = await getDbInstance()
        .collection("2fa_secret_key")
        .insertOne({
          user_id: userDb._id,
          value: authenticator.generateSecret()
        });

      const getOne2FASecretKey = await getDbInstance()
        .collection("2fa_secret_key")
        .findOne({
          _id: insertSecretKey.insertedId
        });
      console.log(getOne2FASecretKey.value);
      twoFASecretKey = getOne2FASecretKey.value;
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

export const setup2FA_Model = async ({ id, clientOtpToken, userAgent }) => {
  try {
    // get user
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

    // get 2fa secret key
    const twoUserSecretKey = await getDbInstance()
      .collection("2fa_secret_key")
      .findOne({
        user_id: userDb._id
      });
    if (!twoUserSecretKey) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "2FA Secret Key not found",
        []
      );
    }

    //check is valid otp token
    const isValidOtpToken = authenticator.verify({
      token: clientOtpToken,
      secret: twoUserSecretKey.value
    });
    if (!isValidOtpToken) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "OTP Token is not valid",
        []
      );
    }

    //update user
    const updateUser = await getDbInstance()
      .collection("users")
      .findOneAndUpdate(
        { _id: userDb._id },
        {
          $set: {
            enable_2fa: true
          }
        },
        {
          returnDocument: "after",
          returnNewDocument: true
        }
      );

    //create sessions
    const insertUserSessions = await getDbInstance()
      .collection("user_sessions")
      .insertOne({
        user_id: userDb._id,
        device_id: userAgent,
        is_2fa_verified: true,
        last_login: new Date().valueOf()
      });

    //get one session

    const newUserSection = await getDbInstance()
      .collection("user_sessions")
      .findOne({
        _id: insertUserSessions.insertedId
      });

    return { ...updateUser, ...newUserSection };
  } catch (error) {
    throw new Error(error);
  }
};
