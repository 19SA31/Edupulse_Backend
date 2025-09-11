import {
  SignUpServiceDTO,
  OtpCheckServiceDTO,
  LoginServiceDTO,
  LoginServiceResponseDTO,
  ResetPasswordServiceDTO,
} from "../../dto/tutor/TutorAuthDTO";

export interface ITutorAuthInterface {
  signUp(tutorData: SignUpServiceDTO): Promise<boolean>;
  
  otpCheck(tutorData: OtpCheckServiceDTO): Promise<boolean>;
  
  loginService(tutorData: LoginServiceDTO): Promise<LoginServiceResponseDTO>;
  
  resetPasswordService(tutorData: ResetPasswordServiceDTO): Promise<void>;
}