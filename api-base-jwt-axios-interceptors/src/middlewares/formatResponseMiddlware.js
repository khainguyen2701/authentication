export const formatResponseMiddleware = (req, res, next) => {
  res.actionResponse = (action, data, statusCode, message) => {
    const messageDefaults = {
      get: "Get Details Successfully",
      post: "Created Successfully",
      put: "Updated Successfully",
      delete: "Deleted Successfully",
      gets: " Get List Successfully"
    };
    const resMessage = message || messageDefaults[action];
    res.status(statusCode).json({
      status: "success",
      message: resMessage,
      data: data || null,
      statusCode: statusCode
    });
  };
  next();
};
