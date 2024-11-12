import { loginModel } from "~/models/userModels";

/* eslint-disable no-useless-catch */
export const loginService = async ({ email, password }) => {
  try {
    const user = await loginModel({ email, password });
    return user;
  } catch (error) {
    throw error;
  }
};
