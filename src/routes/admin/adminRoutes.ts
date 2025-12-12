import express from "express";
import { AuthenticationController } from "../../controllers/Authentication/Auth";
import { AdminController } from "../../controllers/admin/AdminController";
import { S3Service } from "../../utils/s3";

import { AuthService } from "../../services/user/authUserService";
import { AuthUserRepository } from "../../repositories/user/authUserRepo";
import { AuthTutorService } from "../../services/tutor/authTutorService";
import { AuthTutorRepository } from "../../repositories/tutor/authTutorRepo";
import { AuthAdminService } from "../../services/admin/authAdminService";
import { AuthAdminRepository } from "../../repositories/admin/authAdminRepo";
import { AdminService } from "../../services/admin/adminService";
import { AdminRepository } from "../../repositories/admin/adminRepo";

import { CourseRepository } from "../../repositories/course/courseRepo";
import { CourseService } from "../../services/course/courseService";
import { CourseController } from "../../controllers/course/CourseController";
import EnrollmentService from "../../services/enrollment/enrollmentService";
import EnrollmentRepository from "../../repositories/enrollment/enrollmentRepo";

import { TutorRepository } from "../../repositories/tutor/tutorRepo";

import { verifyToken } from "../../utils/jwt";
import EnrollmentController from "../../controllers/enrollment/enrollemntController";

import { validateLogin } from "../../middlewares/validation/authValidation";
import {
  validateAllMongoIdParams,
  validatePagination,
} from "../../middlewares/validation/commonValidation";
import {
  validateCategoryInput,
  validateRejectionReason,
} from "../../middlewares/validation/adminValidation";
import { validateCourseFilters } from "../../middlewares/validation/courseValidation";
import { validateEnrollmentFilters } from "../../middlewares/validation/enrollmentValidation";

const adminRoutes = express.Router();

const s3Service = new S3Service();
const AuthRepositoryInstance = new AuthUserRepository();
const TutorAuthRepositoryInstance = new AuthTutorRepository();
const AuthAdminRepositoryInstance = new AuthAdminRepository();
const AdminRepositoryInstance = new AdminRepository();

const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const TutorAuthServiceInstance = new AuthTutorService(
  TutorAuthRepositoryInstance
);
const AuthAdminServiceInstance = new AuthAdminService(
  AuthAdminRepositoryInstance
);
const AdminServiceInstance = new AdminService(AdminRepositoryInstance);

const AuthenticationControllerInstance = new AuthenticationController(
  AuthServiceInstance,
  TutorAuthServiceInstance,
  AuthAdminServiceInstance
);

const AdminControllerInstance = new AdminController(AdminServiceInstance);

const tutorRepository = new TutorRepository();

const enrollmentRepository = new EnrollmentRepository();
const courseRepository = new CourseRepository();
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
const enrollemntController = new EnrollmentController(enrollmentService);

adminRoutes.post(
  "/login",
  validateLogin,
  AuthenticationControllerInstance.adminLogin.bind(
    AuthenticationControllerInstance
  )
);

adminRoutes.post(
  "/logout",
  AuthenticationControllerInstance.logoutAdmin.bind(
    AuthenticationControllerInstance
  )
);

adminRoutes.get(
  "/users",
  verifyToken("admin"),
  validatePagination,
  AdminControllerInstance.getUsers.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/listUnlistUser/:userId",
  verifyToken("admin"),
  validateAllMongoIdParams,
  AdminControllerInstance.listUnlistUser.bind(AdminControllerInstance)
);

adminRoutes.get(
  "/tutors",
  verifyToken("admin"),
  validatePagination,
  AdminControllerInstance.getTutors.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/listUnlistTutor/:tutorId",
  verifyToken("admin"),
  validateAllMongoIdParams,
  AdminControllerInstance.listUnlistTutor.bind(AdminControllerInstance)
);

adminRoutes.get(
  "/tutors-verification",
  verifyToken("admin"),
  validatePagination,
  AdminControllerInstance.getTutorDocs.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/verify-tutor/:tutorId",
  verifyToken("admin"),
  validateAllMongoIdParams,
  AdminControllerInstance.verifyTutor.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/reject-tutor/:tutorId",
  verifyToken("admin"),
  validateAllMongoIdParams,
  validateRejectionReason,
  AdminControllerInstance.rejectTutor.bind(AdminControllerInstance)
);

adminRoutes.get(
  "/categories",
  verifyToken("admin"),
  validatePagination,
  AdminControllerInstance.getCategories.bind(AdminControllerInstance)
);

adminRoutes.post(
  "/add-category",
  verifyToken("admin"),
  validateCategoryInput,
  AdminControllerInstance.addCategory.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/update-category/:id",
  verifyToken("admin"),
  validateAllMongoIdParams,
  validateCategoryInput,
  AdminControllerInstance.editCategory.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/toggle-category/:id",
  verifyToken("admin"),
  validateAllMongoIdParams,
  AdminControllerInstance.toggleCategoryStatus.bind(AdminControllerInstance)
);

adminRoutes.get(
  "/publish-courses",
  verifyToken("admin"),
  validatePagination,
  courseController.getAllUnpublishedCourses.bind(courseController)
);

adminRoutes.put(
  "/publish-course/:id",
  verifyToken("admin"),
  validateAllMongoIdParams,
  courseController.publishCourse.bind(courseController)
);

adminRoutes.put(
  "/reject-course/:id",
  verifyToken("admin"),
  validateAllMongoIdParams,
  validateRejectionReason,
  courseController.rejectCourse.bind(courseController)
);

adminRoutes.get(
  "/course-listing",
  verifyToken("admin"),
  validateCourseFilters,
  courseController.getPublishedCourses.bind(courseController)
);

adminRoutes.put(
  "/listunlist-course/:id",
  verifyToken("admin"),
  validateAllMongoIdParams,
  courseController.listUnlistCourse.bind(courseController)
);

adminRoutes.get(
  "/enrollments",
  verifyToken("admin"),
  validateEnrollmentFilters,
  enrollemntController.getAllEnrollments.bind(enrollemntController)
);
export default adminRoutes;
