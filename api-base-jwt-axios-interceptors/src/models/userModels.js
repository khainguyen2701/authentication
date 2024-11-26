import { StatusCodes } from "http-status-codes";
import { pick } from "lodash";
import { ObjectId } from "mongodb";
import { getDbInstance } from "~/config/mongodb";
import ApiError from "~/until/apiError";
import { authenticator } from "otplib"; //random secret key
import qrCode from "qrcode";

export const loginModel = async ({ email, password, deviceId }) => {
  try {
    //get one user
    const user = await getDbInstance().collection("users").findOne({
      email,
      password
    });
    if (!user) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Your email or password is incorrect!",
        []
      );
    }
    const pickUser = pick(user, ["_id", "email", "enable_2fa"]);

    // check enabled 2fa device
    if (pickUser.enable_2fa) {
      const userSession = await getDbInstance()
        .collection("user_sessions")
        .findOne({
          user_id: user._id,
          device_id: deviceId
        });
      //If userSession doesn't exist, create a new user session and get its device
      if (!userSession) {
        const createUserSession = await getDbInstance()
          .collection("user_sessions")
          .insertOne({
            user_id: user._id,
            device_id: deviceId,
            is_2fa_verified: false,
            last_login: new Date().valueOf()
          });
        const getOneUserSession = await getDbInstance()
          .collection("user_sessions")
          .findOne({
            _id: createUserSession.insertedId,
            device_id: deviceId
          });
        if (getOneUserSession) {
          pickUser["is_2fa_verified"] =
            getOneUserSession.is_2fa_verified || null;
          pickUser["last_login"] = getOneUserSession.last_login || null;
        } else {
          throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Create User Session Failed",
            []
          );
        }
      } else {
        pickUser["is_2fa_verified"] = userSession.is_2fa_verified || null;
        pickUser["last_login"] = userSession.last_login || null;
      }
    }
    return pickUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const detailUserModel = async ({ id, deviceId }) => {
  try {
    const idMongo = new ObjectId(id);
    const user = await getDbInstance().collection("users").findOne({
      _id: idMongo
    });
    if (!user) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Cannot find user",
        []
      );
    }
    const pickUser = pick(user, ["_id", "email", "enable_2fa"]);
    if (user.enable_2fa) {
      const userSession = await getDbInstance()
        .collection("user_sessions")
        .findOne({
          user_id: user._id,
          device_id: deviceId
        });

      if (userSession) {
        pickUser["is_2fa_verified"] = userSession.is_2fa_verified || null;
        pickUser["last_login"] = userSession.last_login || null;
      }
    }
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
      twoFASecretKey = getOne2FASecretKey.value;
    } else {
      twoFASecretKey = twoUserSecretKey.value;
    }
    // create otp token
    const createOtpToken = authenticator.keyuri(
      userDb,
      `2FA - ${userDb.email}`,
      twoFASecretKey
    );

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

    return { ...updateUser, section: newUserSection };
  } catch (error) {
    throw new Error(error);
  }
};

export const logoutModel = async ({ id, deviceId }) => {
  try {
    const idMongo = new ObjectId(id);
    const user = await getDbInstance().collection("users").findOne({
      _id: idMongo
    });
    if (!user) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Cannot find user",
        []
      );
    }
    await getDbInstance().collection("user_sessions").deleteOne({
      user_id: idMongo,
      device_id: deviceId
    });
    return {};
  } catch (error) {
    throw new Error(error);
  }
};

export const verify2FA_Model = async ({ id, clientOtpToken, userAgent }) => {
  try {
    const idMongo = new ObjectId(id);
    const user = await getDbInstance().collection("users").findOne({
      _id: idMongo
    });
    if (!user) {
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
        user_id: user._id
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

    const updateUserSession = await getDbInstance()
      .collection("user_sessions")
      .findOneAndUpdate(
        {
          user_id: user._id,
          device_id: userAgent
        },
        {
          $set: {
            is_2fa_verified: true
          }
        },
        {
          returnDocument: "after",
          returnNewDocument: true
        }
      );

    const pickUser = pick(user, ["_id", "email", "enable_2fa"]);
    return { ...pickUser, section: updateUserSession };
  } catch (error) {
    throw new Error(error);
  }
};
