import { StatusCodes } from "http-status-codes";
import ms from "ms";
import { env } from "~/config/env";
import { JWTProvider } from "~/providers/JwtProvider";

const MOCK_DATABASE = {
  USER: {
    ID: "sample-id-12345678",
    EMAIL: "khai.dev27@gmail.com",
    PASSWORD: "123456789"
  }
};

const login = async (req, res) => {
  try {
    if (
      req.body.email !== MOCK_DATABASE.USER.EMAIL ||
      req.body.password !== MOCK_DATABASE.USER.PASSWORD
    ) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Your email or password is incorrect!" });
      return;
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

    res.status(StatusCodes.OK).json({ ...userInfo, accessToken, refreshToken });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(StatusCodes.OK).json({ message: "Logout API success!" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const refreshToken = async (req, res) => {
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

    res.status(StatusCodes.OK).json({ accessToken });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const userController = {
  login,
  logout,
  refreshToken
};
