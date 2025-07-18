import express from "express";
import { AuthAdminController } from "../../controllers/admin/Auth";
import { AuthAdminService } from "../../services/admin/authAdminService";
import { AuthAdminRepository } from "../../repositories/admin/authAdminRepo";
import { AdminController } from "../../controllers/admin/AdminController";
import { AdminService } from "../../services/admin/adminService";
import { AdminRepository } from "../../repositories/admin/adminRepo";
import { verifyToken } from "../../utils/jwt";

const adminRoutes = express.Router();

const AuthAdminRepositoryInstance = new AuthAdminRepository();
const AuthAdminServiceInstance = new AuthAdminService(
  AuthAdminRepositoryInstance
);
const AuthAdminControllerInstance = new AuthAdminController(
  AuthAdminServiceInstance
);

const AdminRepositoryInstance = new AdminRepository();
const AdminServiceInstance = new AdminService(AdminRepositoryInstance);
const AdminControllerInstance = new AdminController(AdminServiceInstance);

adminRoutes.post(
  "/login",
  AuthAdminControllerInstance.adminLogin.bind(AuthAdminControllerInstance)
);
adminRoutes.post(
  "/logout",
  AuthAdminControllerInstance.logoutAdmin.bind(AuthAdminControllerInstance)
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
