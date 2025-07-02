import { UserProfileData, GetUserData } from "../userInterface/userInterface";

export interface IAuthService {
  signUp(userData: {
    name?: string;
    email: string;
    phone?: string;
    password?: string;
    isForgot?: boolean;
  }): Promise<void>;

  otpCheck(userData: {
    name?: string;
    email: string;
    phone?: string;
    password?: string;
    otp: string;
    isForgot?: boolean;
  }): Promise<boolean>;

  loginService(userData: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserProfileData;
  }>;

  resetPasswordService(userData: {
    email: string;
    password: string;
  }): Promise<void>;
}
