import { StatusCodes } from "http-status-codes";
import { env } from "~/config/env";

export const errorBoundary = (err, req, res, next) => {
  if (!err.statusCode) {
    err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
  const responseError = {
    statusCode: err?.statusCode,
    message: err?.message || StatusCodes[err.statusCode],
    status: "Error",
    stack: err?.stack,
    errors: err.errors || []
  };
  if (env.buildMode !== "dev") delete responseError.stack;
  return res.status(responseError.statusCode).json(responseError);
};
