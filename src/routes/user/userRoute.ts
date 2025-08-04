import express from "express";
import multer from "multer";
import { AuthenticationController } from "../../controllers/Authentication/Auth";
import UserController from "../../controllers/user/UserController";
import UserService from "../../services/user/userService";
import UserRepository from "../../repositories/user/userRepo";
import { verifyToken } from "../../utils/jwt";


import { AuthService } from "../../services/user/authUserService";
import { AuthUserRepository } from "../../repositories/user/authUserRepo";
import { AuthTutorService } from "../../services/tutor/authTutorService";
import { AuthTutorRepository } from "../../repositories/tutor/authTutorRepo";
import { AuthAdminService } from "../../services/admin/authAdminService";
import { AuthAdminRepository } from "../../repositories/admin/authAdminRepo";

const userRoute = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      const error = new Error("Only image files are allowed") as any;
      cb(error, false);
    }
  },
});

const uploadAvatar = upload.single("avatar");


const AuthRepositoryInstance = new AuthUserRepository();
const TutorAuthRepositoryInstance = new AuthTutorRepository();
const AuthAdminRepositoryInstance = new AuthAdminRepository();


const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const TutorAuthServiceInstance = new AuthTutorService(TutorAuthRepositoryInstance);
const AuthAdminServiceInstance = new AuthAdminService(AuthAdminRepositoryInstance);


const AuthenticationControllerInstance = new AuthenticationController(
  AuthServiceInstance,
  TutorAuthServiceInstance,
  AuthAdminServiceInstance
);


const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);


userRoute.post(
  "/send-otp",
  AuthenticationControllerInstance.sendUserOtp.bind(AuthenticationControllerInstance)
);

userRoute.post(
  "/verify-otp",
  AuthenticationControllerInstance.verifyUserOtp.bind(AuthenticationControllerInstance)
);

userRoute.post(
  "/login",
  AuthenticationControllerInstance.userLogin.bind(AuthenticationControllerInstance)
);

userRoute.post(
  "/logout",
  AuthenticationControllerInstance.logoutUser.bind(AuthenticationControllerInstance)
);

userRoute.patch(
  "/reset-password",
  AuthenticationControllerInstance.resetUserPassword.bind(AuthenticationControllerInstance)
);

// User-specific routes using UserController
userRoute.put(
  "/profile/update-profile",
  verifyToken("user"),
  uploadAvatar,
  userController.updateProfile.bind(userController)
);

userRoute.get(
  "/profile",
  verifyToken("user"),
  userController.getUserProfile.bind(userController)
);

export default userRoute;