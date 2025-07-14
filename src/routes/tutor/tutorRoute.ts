import express from'express'
import multer from 'multer';
import { AuthTutorController } from '../../controllers/tutor/Auth'
import { AuthTutorService } from '../../services/tutor/authTutorService'
import { AuthTutorRepository } from '../../repositories/tutor/authTutorRepo'
import { TutorController } from '../../controllers/tutor/TutorController';
import { TutorService } from '../../services/tutor/tutorService';
import { TutorRepository } from '../../repositories/tutor/tutorRepo';
import { S3Service } from '../../utils/s3';

const tutorRoute = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    // Allow both images and PDFs for documents
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      const error = new Error('Only image and PDF files are allowed') as any;
      error.code = 'LIMIT_FILE_TYPE';
      cb(error, false);
    }
  }
});

const uploadDocuments = upload.fields([
  { name: 'avatar', maxCount: 1},
  { name: 'degree', maxCount: 1 },
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 }
]);


const AuthTutorRepositoryInstance= new AuthTutorRepository()
const AuthTutorServiceInstance= new AuthTutorService(AuthTutorRepositoryInstance)
const AuthTutorControllerInstance = new AuthTutorController(AuthTutorServiceInstance)

const s3Service = new S3Service();
const tutorRepository = new TutorRepository();
const tutorService = new TutorService(tutorRepository, s3Service);
const tutorController = new TutorController(tutorService);


tutorRoute.post('/send-otp', AuthTutorControllerInstance.sendOtp.bind(AuthTutorControllerInstance))
tutorRoute.post('/verify-otp', AuthTutorControllerInstance.verifyOtp.bind(AuthTutorControllerInstance))
tutorRoute.post('/login',AuthTutorControllerInstance.tutorLogin.bind(AuthTutorControllerInstance))
tutorRoute.post('/logout',AuthTutorControllerInstance.logoutTutor.bind(AuthTutorControllerInstance))


tutorRoute.patch('/reset-password',AuthTutorControllerInstance.resetPassword.bind(AuthTutorControllerInstance))

tutorRoute.post('/verify-documents', 
  uploadDocuments,
  tutorController.submitVerificationDocuments.bind(tutorController)
);

tutorRoute.get('/verification/status', 
  tutorController.getVerificationStatus.bind(tutorController)
);





export default tutorRoute