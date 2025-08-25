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

const courseRepository = new CourseRepository();
const courseService = new CourseService(courseRepository, s3Service);
const courseController = new CourseController(courseService);

tutorRoute.post(
  "/send-otp",
  AuthenticationControllerInstance.sendTutorOtp.bind(
    AuthenticationControllerInstance
  )
);

tutorRoute.post(
  "/verify-otp",
  AuthenticationControllerInstance.verifyTutorOtp.bind(
    AuthenticationControllerInstance
  )
);

tutorRoute.post(
  "/login",
  AuthenticationControllerInstance.tutorLogin.bind(
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
  tutorController.getTutorProfile.bind(tutorController)
);

tutorRoute.put(
  "/update-profile",
  verifyToken("tutor"),
  authMiddleware,
  uploadAvatar,
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
  courseController.createCourse.bind(courseController)
);

export default tutorRoute;
