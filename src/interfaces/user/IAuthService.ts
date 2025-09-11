import { 
  SignUpRequestDto, 
  VerifyOtpRequestDto, 
  LoginRequestDto, 
  ResetPasswordRequestDto,
  LoginServiceResultDto 
} from "../../dto/user/UserAuthDTO";

export interface IAuthService {
  signUp(userData: SignUpRequestDto): Promise<void>;
  otpCheck(userData: VerifyOtpRequestDto): Promise<boolean>;
  loginService(userData: LoginRequestDto): Promise<LoginServiceResultDto>;
  resetPasswordService(userData: ResetPasswordRequestDto): Promise<void>;
}
