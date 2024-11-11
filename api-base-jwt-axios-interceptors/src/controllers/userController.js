import { StatusCodes } from "http-status-codes";
import ms from "ms";
import { env } from "~/config/env";
import { JWTProvider } from "~/providers/JwtProvider";
import ApiError from "~/until/apiError";

const MOCK_DATABASE = {
  USER: {
    ID: "sample-id-12345678",
    EMAIL: "khai.dev27@gmail.com",
    PASSWORD: "123456789"
  }
};

const login = async (req, res, next) => {
  try {
    if (
      req.body.email !== MOCK_DATABASE.USER.EMAIL ||
      req.body.password !== MOCK_DATABASE.USER.PASSWORD
    ) {
      const error = new ApiError(
        StatusCodes.FORBIDDEN,
        "Your email or password is incorrect!",
        []
      );
      throw error;
    }

    // query db get user information
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    };
    // Create access token
    const accessToken = await JWTProvider.generateToken(
      userInfo,
      env.signature_access_token,
      5
    );

    // Create refresh token
    const refreshToken = await JWTProvider.generateToken(
      userInfo,
      env.signature_refresh_token,
      "14 days"
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days") // Phải khác thời gian sống của access token
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days")
    });

    res.actionResponse(
      "get",
      { ...userInfo, accessToken, refreshToken },
      StatusCodes.OK,
      "Login API success!"
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.actionResponse("get", {}, StatusCodes.OK, "Logout API success!");
  } catch (error) {
    const resError = ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || "Internal Server Error",
      []
    );
    next(resError);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    // C1: Lấy refresh token từ cookie
    // const refreshTokenCookies = req.cookies.refreshToken;
    // C2: Lấy refresh token từ FE req.body
    const refreshTokenBody = req.body.refreshToken;

    const verifyToken = await JWTProvider.verifyToken(
      refreshTokenBody,
      env.signature_refresh_token
    );

    const user = {
      id: verifyToken.id,
      email: verifyToken.email
    };

    const accessToken = await JWTProvider.generateToken(
      user,
      env.signature_access_token,
      5
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days")
    });

    res.actionResponse("get", { accessToken }, StatusCodes.OK);
  } catch (error) {
    const resError = ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || "Internal Server Error",
      []
    );
    next(resError);
  }
};

export const userController = {
  login,
  logout,
  refreshToken
};
