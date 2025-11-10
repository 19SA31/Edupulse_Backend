import {
  SignUpRequestDto,
  VerifyOtpRequestDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
  LoginServiceResultDto,
  GoogleUserData
} from "../../dto/user/UserAuthDTO";
import {
  UserProfileData,
} from "../userInterface/userInterface";

export interface IAuthService {
  signUp(userData: SignUpRequestDto): Promise<void>;
  otpCheck(userData: VerifyOtpRequestDto): Promise<boolean>;
  loginService(userData: LoginRequestDto): Promise<LoginServiceResultDto>;
  resetPasswordService(userData: ResetPasswordRequestDto): Promise<void>;
  findUserByEmail(email: string): Promise<UserProfileData | null>;
  createGoogleUser(userData: GoogleUserData): Promise<UserProfileData>;
  getCompleteUserProfile(email: string): Promise<UserProfileData | null> 
}
