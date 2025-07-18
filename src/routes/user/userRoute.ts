// routes/userRoutes.ts
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

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      const error = new Error("Only image files are allowed") as any;
      cb(error, false);
    }
  },
});

// Single file upload for avatar (matches the frontend field name)
const uploadAvatar = upload.single("avatar");

// Auth instances
const AuthRepositoryInstance = new AuthUserRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

// Profile instances
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Auth routes
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

// Profile routes
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

userRoute.get("categories", verifyToken("user"));

export default userRoute;
