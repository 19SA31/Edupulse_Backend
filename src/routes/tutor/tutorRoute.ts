import express from "express";
import multer from "multer";
import { AuthenticationController } from "../../controllers/Authentication/Auth";
import { TutorController } from "../../controllers/tutor/TutorController";
import { TutorService } from "../../services/tutor/tutorService";
import { TutorRepository } from "../../repositories/tutor/tutorRepo";
import { S3Service } from "../../utils/s3";
import { verifyToken } from "../../utils/jwt";

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

const storage = multer.memoryStorage();

const uploadDocumentsConfig = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      const error = new Error("Only image and PDF files are allowed") as any;
      error.code = "LIMIT_FILE_TYPE";
      cb(error, false);
    }
  },
});

const uploadAvatarConfig = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      const error = new Error("Only image files are allowed") as any;
      error.code = "LIMIT_FILE_TYPE";
      cb(error, false);
    }
  },
});

const uploadCourseConfig = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      const error = new Error("Invalid file type for course materials") as any;
      error.code = "LIMIT_FILE_TYPE";
      cb(error, false);
    }
  },
});

const uploadCourseFiles = uploadCourseConfig.any();

const uploadDocuments = uploadDocumentsConfig.fields([
  { name: "avatar", maxCount: 1 },
  { name: "degree", maxCount: 1 },
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
]);

const uploadAvatar = uploadAvatarConfig.single("avatar");

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
