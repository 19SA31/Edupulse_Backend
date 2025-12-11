import express from "express";
import multer from "multer";
import { AuthenticationController } from "../../controllers/Authentication/Auth";
import UserController from "../../controllers/user/UserController";
import UserService from "../../services/user/userService";
import UserRepository from "../../repositories/user/userRepo";
import { verifyToken } from "../../utils/jwt";
import { S3Service } from "../../utils/s3";
import { createAuthMiddleware } from "../../middlewares/authMiddleware";

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

import EnrollmentController from "../../controllers/enrollment/enrollemntController";
import EnrollmentService from "../../services/enrollment/enrollmentService";
import EnrollmentRepository from "../../repositories/enrollment/enrollmentRepo";

import {
  validateSignup,
  validateOtpVerification,
  validateLogin,
  validatePasswordReset,
  validateGoogleAuth,
} from "../../middlewares/validation/authValidation";
import { validateAllMongoIdParams } from "../../middlewares/validation/commonValidation";
import { validateCourseFilters } from "../../middlewares/validation/courseValidation";
import { validateProfileUpdate } from "../../middlewares/validation/profileValidation";
import {
  validatePaymentCreation,
  validatePaymentVerification,
  validateEnrollmentFilters,
} from "../../middlewares/validation/enrollmentValidation";

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

const authMiddleware = createAuthMiddleware("user", userService);

const courseRepository = new CourseRepository();
const tutorRepository = new TutorRepository();

const enrollmentRepository = new EnrollmentRepository();
const enrollmentService = new EnrollmentService(
  enrollmentRepository,
  courseRepository,
  tutorRepository,
  s3Service
);

const courseService = new CourseService(
  courseRepository,
  s3Service,
  enrollmentService
);
const courseController = new CourseController(courseService);

const tutorService = new TutorService(tutorRepository, s3Service);
const tutorController = new TutorController(tutorService);

const enrollmentController = new EnrollmentController(enrollmentService);

userRoute.post(
  "/send-otp",
  validateSignup,
  AuthenticationControllerInstance.sendUserOtp.bind(
    AuthenticationControllerInstance
  )
);

userRoute.post(
  "/verify-otp",
  validateOtpVerification,
  AuthenticationControllerInstance.verifyUserOtp.bind(
    AuthenticationControllerInstance
  )
);

userRoute.post(
  "/login",
  validateLogin,
  AuthenticationControllerInstance.userLogin.bind(
    AuthenticationControllerInstance
  )
);

userRoute.post(
  "/google-auth",
  validateGoogleAuth,
  AuthenticationControllerInstance.googleUserAuth.bind(
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
  validatePasswordReset,
  AuthenticationControllerInstance.resetUserPassword.bind(
    AuthenticationControllerInstance
  )
);

userRoute.put(
  "/profile/update-profile",
  verifyToken("user"),
  authMiddleware,
  uploadAvatar,
  validateProfileUpdate,
  userController.updateProfile.bind(userController)
);

userRoute.get(
  "/profile",
  verifyToken("user"),
  authMiddleware,
  userController.getUserProfile.bind(userController)
);

userRoute.get(
  "/listed-tutors",
  tutorController.getAllListedTutors.bind(tutorController)
);

userRoute.get(
  "/all-courses",
  courseController.getAllCourses.bind(courseController)
);

userRoute.get(
  "/listed-courses",
  verifyToken("user"),
  authMiddleware,
  validateCourseFilters,
  courseController.getAllListedCourses.bind(courseController)
);

userRoute.get(
  "/listed-categories",
  courseController.getAllListedCategories.bind(courseController)
);

userRoute.get(
  "/course-details/:id",
  verifyToken("user"),
  authMiddleware,
  validateAllMongoIdParams,
  courseController.getCourseDetails.bind(courseController)
);

userRoute.post(
  "/create-payment",
  verifyToken("user"),
  authMiddleware,
  validatePaymentCreation,
  enrollmentController.createPayment.bind(enrollmentController)
);

userRoute.post(
  "/verify-payment",
  verifyToken("user"),
  authMiddleware,
  validatePaymentVerification,
  enrollmentController.verifyPayment.bind(enrollmentController)
);

userRoute.get(
  "/verify-enrollment/:courseId",
  verifyToken("user"),
  authMiddleware,
  validateAllMongoIdParams,
  enrollmentController.verifyEnrollment.bind(enrollmentController)
);

userRoute.get(
  "/user-payments",
  verifyToken("user"),
  authMiddleware,
  enrollmentController.getUserEnrollments.bind(enrollmentController)
);

userRoute.get(
  "/courses-enrolled",
  verifyToken("user"),
  validateEnrollmentFilters,
  enrollmentController.getEnrolledCourses.bind(enrollmentController)
);

export default userRoute;
