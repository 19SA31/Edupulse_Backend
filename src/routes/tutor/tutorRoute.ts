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
  uploadCourseFiles 
} from "../../utils/multer";

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
  uploadDocuments,
  tutorController.submitVerificationDocuments.bind(tutorController)
);

tutorRoute.get(
  "/verification/status",
  verifyToken("tutor"),
  tutorController.getVerificationStatus.bind(tutorController)
);


tutorRoute.get(
  "/profile",
  verifyToken("tutor"),
  tutorController.getTutorProfile.bind(tutorController)
);

tutorRoute.put(
  "/profile/update-profile",
  verifyToken("tutor"),
  uploadAvatar,
  tutorController.updateTutorProfile.bind(tutorController)
);


tutorRoute.get(
  "/course/get-category",
  verifyToken("tutor"),
  courseController.getCategoryNames.bind(courseController)
);

tutorRoute.post(
  "/course/create",
  verifyToken("tutor"),
  uploadCourseFiles,
  courseController.createCourse.bind(courseController)
);

export default tutorRoute;