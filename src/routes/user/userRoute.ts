// routes/userRoutes.ts
import express from 'express';
import { AuthController } from '../../controllers/user/Auth';
import { AuthService } from '../../services/user/authUserService';
import { AuthUserRepository } from '../../repositories/user/authUserRepo';
import UserController from '../../controllers/user/UserController';
import UserService from '../../services/user/userService';
import UserRepository from '../../repositories/user/userRepo';
import { verifyToken } from '../../utils/jwt';
import upload from '../../config/multerConfig'; // Import multer config

const userRoute = express.Router();

// Auth instances
const AuthRepositoryInstance = new AuthUserRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

// Profile instances
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Auth routes
userRoute.post('/send-otp', AuthControllerInstance.sendOtp.bind(AuthControllerInstance));
userRoute.post('/verify-otp', AuthControllerInstance.verifyOtp.bind(AuthControllerInstance));
userRoute.post('/login', AuthControllerInstance.userLogin.bind(AuthControllerInstance));
userRoute.post('/logout', AuthControllerInstance.logoutUser.bind(AuthControllerInstance));
userRoute.patch('/reset-password', AuthControllerInstance.resetPassword.bind(AuthControllerInstance));

// Profile routes
userRoute.put('/profile/update-profile', 
  verifyToken('user'), 
  upload.single('avatar'), 
  userController.updateProfile.bind(userController)
);

userRoute.get('/profile', 
  verifyToken('user'), 
  userController.getUserProfile.bind(userController)
);

export default userRoute;