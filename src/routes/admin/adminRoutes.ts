import express from "express";
import { AuthenticationController } from "../../controllers/Authentication/Auth";
import { AdminController } from "../../controllers/admin/AdminController";


import { AuthService } from "../../services/user/authUserService";
import { AuthUserRepository } from "../../repositories/user/authUserRepo";
import { AuthTutorService } from "../../services/tutor/authTutorService";
import { AuthTutorRepository } from "../../repositories/tutor/authTutorRepo";
import { AuthAdminService } from "../../services/admin/authAdminService";
import { AuthAdminRepository } from "../../repositories/admin/authAdminRepo";
import { AdminService } from "../../services/admin/adminService";
import { AdminRepository } from "../../repositories/admin/adminRepo";

import { verifyToken } from "../../utils/jwt";

const adminRoutes = express.Router();


const AuthRepositoryInstance = new AuthUserRepository();
const TutorAuthRepositoryInstance = new AuthTutorRepository();
const AuthAdminRepositoryInstance = new AuthAdminRepository();
const AdminRepositoryInstance = new AdminRepository();


const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const TutorAuthServiceInstance = new AuthTutorService(TutorAuthRepositoryInstance);
const AuthAdminServiceInstance = new AuthAdminService(AuthAdminRepositoryInstance);
const AdminServiceInstance = new AdminService(AdminRepositoryInstance);


const AuthenticationControllerInstance = new AuthenticationController(
  AuthServiceInstance,
  TutorAuthServiceInstance,
  AuthAdminServiceInstance
);


const AdminControllerInstance = new AdminController(AdminServiceInstance);


adminRoutes.post(
  "/login",
  AuthenticationControllerInstance.adminLogin.bind(AuthenticationControllerInstance)
);

adminRoutes.post(
  "/logout",
  AuthenticationControllerInstance.logoutAdmin.bind(AuthenticationControllerInstance)
);




adminRoutes.get(
  "/users",
  verifyToken("admin"),
  AdminControllerInstance.getUsers.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/listUnlistUser/:userId",
  verifyToken("admin"),
  AdminControllerInstance.listUnlistUser.bind(AdminControllerInstance)
);

adminRoutes.get(
  "/tutors",
  verifyToken("admin"),
  AdminControllerInstance.getTutors.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/listUnlistTutor/:tutorId",
  verifyToken("admin"),
  AdminControllerInstance.listUnlistTutor.bind(AdminControllerInstance)
);

adminRoutes.get(
  "/tutors-verification",
  verifyToken("admin"),
  AdminControllerInstance.getTutorDocs.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/verify-tutor/:tutorId",
  verifyToken("admin"),
  AdminControllerInstance.verifyTutor.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/reject-tutor/:tutorId",
  verifyToken("admin"),
  AdminControllerInstance.rejectTutor.bind(AdminControllerInstance)
);


adminRoutes.get(
  "/categories",
  verifyToken("admin"),
  AdminControllerInstance.getCategories.bind(AdminControllerInstance)
);

adminRoutes.post(
  "/add-category",
  verifyToken("admin"),
  AdminControllerInstance.addCategory.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/update-category/:id",
  verifyToken("admin"),
  AdminControllerInstance.editCategory.bind(AdminControllerInstance)
);

adminRoutes.put(
  "/toggle-category/:id",
  verifyToken("admin"),
  AdminControllerInstance.toggleCategoryStatus.bind(AdminControllerInstance)
);

export default adminRoutes;