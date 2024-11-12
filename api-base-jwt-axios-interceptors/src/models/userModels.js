import { StatusCodes } from "http-status-codes";
import { getDbInstance } from "~/config/mongodb";
import ApiError from "~/until/apiError";

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
