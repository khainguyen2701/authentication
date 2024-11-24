import express from "express";
import { userController } from "~/controllers/userController";

const Router = express.Router();

// API đăng nhập.
Router.route("/login").post(userController.login);

// API đăng xuất.
Router.route("/logout").delete(userController.logout);

// API Refresh Token - Cấp lại Access Token mới.
Router.route("/refresh_token").put(userController.refreshToken);

Router.route("/profile/:id").get(userController.getUserProfile);

Router.route("/:id/get_2fa_qr_code").get(userController.get2FA_QRCode);

Router.route("/:id/setup_2fa").post(userController.setup2FA);

export const userRoute = Router;
