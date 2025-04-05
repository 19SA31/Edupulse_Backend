import express from'express'
import { AuthController } from '../../controllers/user/Auth'
import { AuthService } from '../../services/user/authUserService'
import { AuthUserRepository } from '../../repositories/user/authUserRepo'

const authRoute = express.Router()
 
const AuthRepositoryInstance= new AuthUserRepository()
const AuthServiceInstance= new AuthService(AuthRepositoryInstance)
const AuthControllerInstance = new AuthController(AuthServiceInstance)





authRoute.post('/send-otp', AuthControllerInstance.sendOtp.bind(AuthControllerInstance))
authRoute.post('/verify-otp', AuthControllerInstance.verifyOtp.bind(AuthControllerInstance))
authRoute.post('/login',AuthControllerInstance.userLogin.bind(AuthControllerInstance))
authRoute.post('/logout',AuthControllerInstance.logoutUser.bind(AuthControllerInstance))


authRoute.patch('/reset-password',AuthControllerInstance.resetPassword.bind(AuthControllerInstance))
export default authRoute