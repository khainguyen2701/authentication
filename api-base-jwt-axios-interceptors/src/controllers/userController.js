import { StatusCodes } from "http-status-codes";
import ms from "ms";
import { env } from "~/config/env";
import { JWTProvider } from "~/providers/JwtProvider";
import {
  detailUserService,
  get2FA_QRCode_Service,
  loginService,
  profileService,
  setup2FA_Service
} from "~/services/userService";
import ApiError from "~/until/apiError";

const login = async (req, res, next) => {
  try {
    const user = await loginService({
      email: req.body.email,
      password: req.body.password
    });

    // Create access token
    const accessToken = await JWTProvider.generateToken(
      user,
      env.signature_access_token,
      5
    );

    // Create refresh token
    const refreshToken = await JWTProvider.generateToken(
      user,
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
      { ...user, accessToken, refreshToken },
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
      "14 days"
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

const getUserProfile = async (req, res, next) => {
  try {
    const id = req.params.id;
    const profile = await detailUserService({
      id: id
    });

    res.actionResponse(
      "get",
      { ...profile },
      StatusCodes.OK,
      "Get User Profile API success!"
    );
  } catch (error) {
    next(error);
  }
};

const get2FA_QRCode = async (req, res, next) => {
  try {
    const id = req.params.id;
    const twoFA = await get2FA_QRCode_Service({
      id: id
    });

    res.actionResponse(
      "get",
      { ...twoFA },
      StatusCodes.OK,
      "Get 2FA QRCode success!"
    );
  } catch (error) {
    next(error);
  }
};

const setup2FA = async (req, res, next) => {
  try {
    const id = req.params.id;
    const clientOtpToken = req.body.otpToken;
    const userAgent = `${req.headers["user-agent"]}-${new Date().valueOf()}`;
    const twoFA = await setup2FA_Service({
      id: id,
      clientOtpToken: clientOtpToken,
      userAgent: userAgent
    });

    res.actionResponse(
      "get",
      { ...twoFA },
      StatusCodes.OK,
      "Get 2FA QRCode success!"
    );
  } catch (error) {
    next(error);
  }
};

export const userController = {
  login,
  logout,
  refreshToken,
  getUserProfile,
  get2FA_QRCode,
  setup2FA
};
