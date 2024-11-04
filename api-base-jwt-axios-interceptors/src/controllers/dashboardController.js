import { StatusCodes } from "http-status-codes";

const access = async (req, res) => {
  try {
    const jwtDecoded = req.jwtDecoded;
    const userInfo = {
      id: jwtDecoded.id,
      email: jwtDecoded.email
    };

    res.status(StatusCodes.OK).json(userInfo);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const dashboardController = {
  access
};
