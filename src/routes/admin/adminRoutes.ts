import express from'express'
import { AuthAdminController } from '../../controllers/admin/Auth'
import { AuthAdminService } from '../../services/admin/authAdminService'
import { AuthAdminRepository } from '../../repositories/admin/authAdminRepo'
import { AdminController } from '../../controllers/admin/AdminController'
import { AdminService } from '../../services/admin/adminService'
import { AdminRepository } from '../../repositories/admin/adminRepo'

const adminRoutes = express.Router()
 
const AuthAdminRepositoryInstance= new AuthAdminRepository()
const AuthAdminServiceInstance= new AuthAdminService(AuthAdminRepositoryInstance)
const AuthAdminControllerInstance = new AuthAdminController(AuthAdminServiceInstance)

const AdminRepositoryInstance = new AdminRepository;
const AdminServiceInstance = new AdminService(AdminRepositoryInstance)
const AdminControllerInstance = new AdminController(AdminServiceInstance);






adminRoutes.post('/login',AuthAdminControllerInstance.adminLogin.bind(AuthAdminControllerInstance))
adminRoutes.post('/logout',AuthAdminControllerInstance.logoutAdmin.bind(AuthAdminControllerInstance))


adminRoutes.get('/getUsers',AdminControllerInstance.getUsers.bind(AdminControllerInstance));
adminRoutes.put('/listUnlistUser/:userId',AdminControllerInstance.listUnlistUser.bind(AdminControllerInstance));

adminRoutes.get('/getTutors',AdminControllerInstance.getTutors.bind(AdminControllerInstance));
adminRoutes.put('/listUnlistTutor/:tutorId',AdminControllerInstance.listUnlistTutor.bind(AdminControllerInstance));


export default adminRoutes