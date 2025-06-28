import { GetTutorData } from "../tutorInterface/tutorInterface";

export interface ITutorAuthInterface {
  signUp(tutorData: {
    email: string;
    phone?: string;
    isForgot?: boolean;
  }): Promise<boolean>;

  otpCheck(tutorData: {
    name?: string;
    email: string;
    phone?: string;
    password?: string;
    otp: string;
    isForgot?: boolean;
  }): Promise<boolean>;

  loginService(tutorData: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    tutor: GetTutorData;
  }>;

  resetPasswordService(tutorData: {
    email: string;
    password: string;
  }): Promise<void>;
}
