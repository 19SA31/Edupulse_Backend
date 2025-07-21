import express from "express";
import multer from "multer";
import { AuthTutorController } from "../../controllers/tutor/Auth";
import { AuthTutorService } from "../../services/tutor/authTutorService";
import { AuthTutorRepository } from "../../repositories/tutor/authTutorRepo";
import { TutorController } from "../../controllers/tutor/TutorController";
import { TutorService } from "../../services/tutor/tutorService";
import { TutorRepository } from "../../repositories/tutor/tutorRepo";
import { S3Service } from "../../utils/s3";
import { verifyToken } from "../../utils/jwt";

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

const uploadDocuments = uploadDocumentsConfig.fields([
  { name: "avatar", maxCount: 1 },
  { name: "degree", maxCount: 1 },
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
]);

const uploadAvatar = uploadAvatarConfig.single("avatar");

const AuthTutorRepositoryInstance = new AuthTutorRepository();
const AuthTutorServiceInstance = new AuthTutorService(
  AuthTutorRepositoryInstance
);
const AuthTutorControllerInstance = new AuthTutorController(
  AuthTutorServiceInstance
);

const s3Service = new S3Service();
const tutorRepository = new TutorRepository();
const tutorService = new TutorService(tutorRepository, s3Service);
const tutorController = new TutorController(tutorService);

tutorRoute.post(
  "/send-otp",
  AuthTutorControllerInstance.sendOtp.bind(AuthTutorControllerInstance)
);
tutorRoute.post(
  "/verify-otp",
  AuthTutorControllerInstance.verifyOtp.bind(AuthTutorControllerInstance)
);
tutorRoute.post(
  "/login",
  AuthTutorControllerInstance.tutorLogin.bind(AuthTutorControllerInstance)
);
tutorRoute.post(
  "/logout",
  AuthTutorControllerInstance.logoutTutor.bind(AuthTutorControllerInstance)
);

tutorRoute.patch(
  "/reset-password",
  AuthTutorControllerInstance.resetPassword.bind(AuthTutorControllerInstance)
);

tutorRoute.post(
  "/verify-documents",
  verifyToken('tutor'),
  uploadDocuments,
  tutorController.submitVerificationDocuments.bind(tutorController)
);

tutorRoute.get(
  "/verification/status",
  verifyToken('tutor'),
  tutorController.getVerificationStatus.bind(tutorController)
);

tutorRoute.get(
  "/profile",
  verifyToken('tutor'),
  tutorController.getTutorProfile.bind(tutorController)
);

tutorRoute.put(
  "/profile/update-profile",
  verifyToken("tutor"),
  uploadAvatar,
  tutorController.updateTutorProfile.bind(tutorController)
);

export default tutorRoute;