import express from "express";
import { AuthenticationController } from "../../controllers/Authentication/Auth";
import { TutorController } from "../../controllers/tutor/TutorController";
import { TutorService } from "../../services/tutor/tutorService";
import { TutorRepository } from "../../repositories/tutor/tutorRepo";
import { S3Service } from "../../utils/s3";
import { verifyToken } from "../../utils/jwt";
import {
  uploadDocuments,
  uploadAvatar,
  uploadCourseFiles,
} from "../../utils/multer";
import { createAuthMiddleware } from "../../middlewares/authMiddleware";

import { AuthService } from "../../services/user/authUserService";
import { AuthUserRepository } from "../../repositories/user/authUserRepo";
import { AuthTutorService } from "../../services/tutor/authTutorService";
import { AuthTutorRepository } from "../../repositories/tutor/authTutorRepo";
import { AuthAdminService } from "../../services/admin/authAdminService";
import { AuthAdminRepository } from "../../repositories/admin/authAdminRepo";

import { CourseRepository } from "../../repositories/course/courseRepo";
import { CourseService } from "../../services/course/courseService";
import { CourseController } from "../../controllers/course/CourseController";
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
import {
  validateAllMongoIdParams,
  validatePagination,
} from "../../middlewares/validation/commonValidation";
import {
  validateCourseCreation,
  validateCourseUpdate,
} from "../../middlewares/validation/courseValidation";
import {
  validateProfileUpdate,
  validateVerificationDocuments,
} from "../../middlewares/validation/profileValidation";
import { validateSlotCreation } from "../../middlewares/validation/slotValidation";

const tutorRoute = express.Router();

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

const s3Service = new S3Service();
const tutorRepository = new TutorRepository();
const tutorService = new TutorService(tutorRepository, s3Service);
const tutorController = new TutorController(tutorService);
const authMiddleware = createAuthMiddleware("tutor", tutorService);

const enrollmentRepository = new EnrollmentRepository();
const courseRepository = new CourseRepository();
const enrollmentService = new EnrollmentService(
  enrollmentRepository,
  courseRepository,
  tutorRepository,
  s3Service
);
const enrollmentController = new EnrollmentController(enrollmentService);

const courseService = new CourseService(
  courseRepository,
  s3Service,
  enrollmentService
);
const courseController = new CourseController(courseService);

tutorRoute.post(
  "/send-otp",
  validateSignup,
  AuthenticationControllerInstance.sendTutorOtp.bind(
    AuthenticationControllerInstance
  )
);

tutorRoute.post(
  "/verify-otp",
  validateOtpVerification,
  AuthenticationControllerInstance.verifyTutorOtp.bind(
    AuthenticationControllerInstance
  )
);

tutorRoute.post(
  "/login",
  validateLogin,
  AuthenticationControllerInstance.tutorLogin.bind(
    AuthenticationControllerInstance
  )
);

tutorRoute.post(
  "/google-auth",
  validateGoogleAuth,
  AuthenticationControllerInstance.googleTutorAuth.bind(
    AuthenticationControllerInstance
  )
);

tutorRoute.post(
  "/logout",
  AuthenticationControllerInstance.logoutTutor.bind(
    AuthenticationControllerInstance
  )
);

tutorRoute.patch(
  "/reset-password",
  validatePasswordReset,
  AuthenticationControllerInstance.resetTutorPassword.bind(
    AuthenticationControllerInstance
  )
);

tutorRoute.post(
  "/verify-documents",
  verifyToken("tutor"),
  authMiddleware,
  uploadDocuments,
  tutorController.submitVerificationDocuments.bind(tutorController)
);

tutorRoute.get(
  "/profile",
  verifyToken("tutor"),
  authMiddleware,
  validateVerificationDocuments,
  tutorController.getTutorProfile.bind(tutorController)
);

tutorRoute.put(
  "/update-profile",
  verifyToken("tutor"),
  authMiddleware,
  uploadAvatar,
  validateProfileUpdate,
  tutorController.updateTutorProfile.bind(tutorController)
);

tutorRoute.get(
  "/get-category",
  verifyToken("tutor"),
  authMiddleware,
  courseController.getCategoryNames.bind(courseController)
);

tutorRoute.post(
  "/create-course",
  verifyToken("tutor"),
  authMiddleware,
  uploadCourseFiles,
  validateCourseCreation,
  courseController.createCourse.bind(courseController)
);

tutorRoute.get(
  "/tutor-courses",
  verifyToken("tutor"),
  authMiddleware,
  validatePagination,
  courseController.getTutorCourses.bind(courseController)
);

tutorRoute.get(
  "/course-details/:id",
  verifyToken("tutor"),
  authMiddleware,
  validateAllMongoIdParams,
  courseController.getCourseDetails.bind(courseController)
);

tutorRoute.put(
  "/edit-course/:courseId",
  verifyToken("tutor"),
  authMiddleware,
  uploadCourseFiles,
  validateAllMongoIdParams,
  validateCourseUpdate,
  courseController.editCourse.bind(courseController)
);

tutorRoute.post(
  "/create-slots",
  verifyToken("tutor"),
  authMiddleware,
  validateSlotCreation,
  tutorController.createSlots.bind(tutorController)
);

tutorRoute.get(
  "/get-slots",
  verifyToken("tutor"),
  authMiddleware,
  tutorController.getTutorSlots.bind(tutorController)
);

tutorRoute.get(
  "/tutor-revenue",
  verifyToken("tutor"),
  authMiddleware,
  enrollmentController.getTutorRevenue.bind(enrollmentController)
);

tutorRoute.get(
  "/course-enrollments/:courseId",
  verifyToken("tutor"),
  authMiddleware,
  validateAllMongoIdParams,
  validatePagination,
  enrollmentController.getCourseEnrollments.bind(enrollmentController)
);

export default tutorRoute;
