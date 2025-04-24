import express from'express'
import { AuthTutorController } from '../../controllers/tutor/Auth'
import { AuthTutorService } from '../../services/tutor/authTutorService'
import { AuthTutorRepository } from '../../repositories/tutor/authTutorRepo'

const authTutorRoute = express.Router()
 
const AuthTutorRepositoryInstance= new AuthTutorRepository()
const AuthTutorServiceInstance= new AuthTutorService(AuthTutorRepositoryInstance)
const AuthTutorControllerInstance = new AuthTutorController(AuthTutorServiceInstance)





authTutorRoute.post('/send-otp', AuthTutorControllerInstance.sendOtp.bind(AuthTutorControllerInstance))
authTutorRoute.post('/verify-otp', AuthTutorControllerInstance.verifyOtp.bind(AuthTutorControllerInstance))
authTutorRoute.post('/login',AuthTutorControllerInstance.tutorLogin.bind(AuthTutorControllerInstance))
authTutorRoute.post('/logout',AuthTutorControllerInstance.logoutTutor.bind(AuthTutorControllerInstance))


authTutorRoute.patch('/reset-password',AuthTutorControllerInstance.resetPassword.bind(AuthTutorControllerInstance))
export default authTutorRoute