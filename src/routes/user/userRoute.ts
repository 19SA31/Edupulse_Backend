
import express from "express";
import multer from "multer";
import { AuthController } from "../../controllers/user/Auth";
import { AuthService } from "../../services/user/authUserService";
import { AuthUserRepository } from "../../repositories/user/authUserRepo";
import UserController from "../../controllers/user/UserController";
import UserService from "../../services/user/userService";
import UserRepository from "../../repositories/user/userRepo";
import { verifyToken } from "../../utils/jwt";

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
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);


const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRoute.post(
  "/send-otp",
  AuthControllerInstance.sendOtp.bind(AuthControllerInstance)
);
userRoute.post(
  "/verify-otp",
  AuthControllerInstance.verifyOtp.bind(AuthControllerInstance)
);
userRoute.post(
  "/login",
  AuthControllerInstance.userLogin.bind(AuthControllerInstance)
);
userRoute.post(
  "/logout",
  AuthControllerInstance.logoutUser.bind(AuthControllerInstance)
);
userRoute.patch(
  "/reset-password",
  AuthControllerInstance.resetPassword.bind(AuthControllerInstance)
);


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
