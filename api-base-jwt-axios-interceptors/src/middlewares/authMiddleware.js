import { StatusCodes } from "http-status-codes";
import { env } from "~/config/env";
import { JWTProvider } from "~/providers/JwtProvider";

const isAuthorized = async (req, res, next) => {
  // C1: Lấy access token từ header Authorization
  // C2: Lấy access token từ cookies const accessTokenCookie = req.cookies?.accessToken;
  const accessTokenHeaderAuthorization = req.headers.authorization;

  if (!accessTokenHeaderAuthorization) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized! (Token not found)" });
    return;
  }
  try {
    const accessToken = accessTokenHeaderAuthorization.split(" ")[1];
    const accessTokenDecoded = await JWTProvider.verifyToken(
      accessToken,
      env.signature_access_token
    );

    req.jwtDecoded = accessTokenDecoded;
    next();
  } catch (error) {
    // Case 410 refresh token hết hạn
    if (error.message.includes("jwt expired")) {
      res.status(StatusCodes.GONE).json({ message: "Refresh token expired" });
      return;
    }
    // Case 401 must logout
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized! (Token not found)" });
  }
};

export const authMiddleware = {
  isAuthorized
};
