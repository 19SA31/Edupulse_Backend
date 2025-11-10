import {
  SignUpServiceDTO,
  OtpCheckServiceDTO,
  LoginServiceDTO,
  LoginServiceResponseDTO,
  ResetPasswordServiceDTO,
  GoogleTutorData
} from "../../dto/tutor/TutorAuthDTO";
import {
  TutorProfile,
} from "../tutorInterface/tutorInterface";

export interface ITutorAuthInterface {
  signUp(tutorData: SignUpServiceDTO): Promise<boolean>;
  otpCheck(tutorData: OtpCheckServiceDTO): Promise<boolean>;
  loginService(tutorData: LoginServiceDTO): Promise<LoginServiceResponseDTO>;
  resetPasswordService(tutorData: ResetPasswordServiceDTO): Promise<void>;
  findTutorByEmail(email: string): Promise<TutorProfile | null>;
  getCompleteTutorProfile(email: string): Promise<TutorProfile | null>;
  createGoogleTutor(tutorData: GoogleTutorData): Promise<TutorProfile>;
}
