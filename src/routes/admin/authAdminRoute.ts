import express from'express'
import { AuthAdminController } from '../../controllers/admin/Auth'
import { AuthAdminService } from '../../services/admin/authAdminService'
import { AuthAdminRepository } from '../../repositories/admin/authAdminRepo'

const authAdminRoute = express.Router()
 
const AuthAdminRepositoryInstance= new AuthAdminRepository()
const AuthAdminServiceInstance= new AuthAdminService(AuthAdminRepositoryInstance)
const AuthAdminControllerInstance = new AuthAdminController(AuthAdminServiceInstance)






authAdminRoute.post('/login',AuthAdminControllerInstance.adminLogin.bind(AuthAdminControllerInstance))
authAdminRoute.post('/logout',AuthAdminControllerInstance.logoutAdmin.bind(AuthAdminControllerInstance))



export default authAdminRoute