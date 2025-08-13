import express from "express";
import multer from "multer";
import { AuthenticationController } from "../../controllers/Authentication/Auth";
import UserController from "../../controllers/user/UserController";
import UserService from "../../services/user/userService";
import UserRepository from "../../repositories/user/userRepo";
import { verifyToken } from "../../utils/jwt";
import { S3Service } from "../../utils/s3";

import { CourseController } from "../../controllers/course/CourseController";
import { TutorController } from "../../controllers/tutor/TutorController";
import { CourseService } from "../../services/course/courseService";
import { TutorService } from "../../services/tutor/tutorService";
import { CourseRepository } from "../../repositories/course/courseRepo";
import { TutorRepository } from "../../repositories/tutor/tutorRepo";

import { AuthService } from "../../services/user/authUserService";
import { AuthUserRepository } from "../../repositories/user/authUserRepo";
import { AuthTutorService } from "../../services/tutor/authTutorService";
import { AuthTutorRepository } from "../../repositories/tutor/authTutorRepo";
import { AuthAdminService } from "../../services/admin/authAdminService";
import { AuthAdminRepository } from "../../repositories/admin/authAdminRepo";

const userRoute = express.Router();
const s3Service = new S3Service();
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
const TutorAuthServiceInstance = new AuthTutorService(
  TutorAuthRepositoryInstance
);
const AuthAdminServiceInstance = new AuthAdminService(
  AuthAdminRepositoryInstance
);

const AuthenticationControllerInstance = new AuthenticationController(
  AuthServiceInstance,
  TutorAuthServiceInstance,
  AuthAdminServiceInstance
);

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const courseRepository = new CourseRepository();
const courseService = new CourseService(courseRepository, s3Service);
const courseController = new CourseController(courseService);


const tutorRepository = new TutorRepository();
const tutorService = new TutorService(tutorRepository, s3Service);
const tutorController = new TutorController(tutorService);

userRoute.post(
  "/send-otp",
  AuthenticationControllerInstance.sendUserOtp.bind(
    AuthenticationControllerInstance
  )
);

userRoute.post(
  "/verify-otp",
  AuthenticationControllerInstance.verifyUserOtp.bind(
    AuthenticationControllerInstance
  )
);

userRoute.post(
  "/login",
  AuthenticationControllerInstance.userLogin.bind(
    AuthenticationControllerInstance
  )
);

userRoute.post(
  "/logout",
  AuthenticationControllerInstance.logoutUser.bind(
    AuthenticationControllerInstance
  )
);

userRoute.patch(
  "/reset-password",
  AuthenticationControllerInstance.resetUserPassword.bind(
    AuthenticationControllerInstance
  )
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


userRoute.get(
  "/listed-tutors",
  tutorController.getAllListedTutors.bind(tutorController)
);

userRoute.get(
  "/listed-courses",
  courseController.getAllListedCourses.bind(courseController)
);

userRoute.get(
  "/listed-categories",
  courseController.getAllListedCategories.bind(courseController)
);

export default userRoute;
