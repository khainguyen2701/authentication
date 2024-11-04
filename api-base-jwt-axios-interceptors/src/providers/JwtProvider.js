import JWT from "jsonwebtoken";

const generateToken = async (userInfo, secretSign, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSign, {
      expiresIn: tokenLife,
      algorithm: "HS256"
    });
  } catch (e) {
    throw new Error(e);
  }
};

const verifyToken = async (token, secretSign) => {
  try {
    return JWT.verify(token, secretSign);
  } catch (error) {
    throw new Error(error);
  }
};

export const JWTProvider = {
  generateToken,
  verifyToken
};
