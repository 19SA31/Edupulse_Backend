export interface SignUpRequestDto {
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  isForgot?: boolean;
}

export interface VerifyOtpRequestDto {
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  otp: string;
  isForgot?: boolean;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  password: string;
}

export interface GoogleAuthRequestDto {
  credential: string;
}

export interface SignUpResponseDto {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponseDto {
  success: boolean;
  message: string;
}

export interface LoginResponseDto {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: UserProfileResponseDto;
  };
}

export interface ResetPasswordResponseDto {
  success: boolean;
  message: string;
}

export interface LogoutResponseDto {
  success: boolean;
  message: string;
}

export interface UserProfileResponseDto {
  _id: string;
  name: string;
  email: string;
  phone: string;
  DOB?: Date;
  gender?: string;
  avatar?: string;
}

export interface GoogleUserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  googleId: string;
  isEmailVerified: boolean;
}

export interface GoogleAuthUserResponseDto {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isBlocked: boolean;
}

export interface GoogleAuthResponseDto {
  success: boolean;
  message: string;
  data?: {
    user: GoogleAuthUserResponseDto;
    accessToken: string;
  };
}

export interface LoginServiceResultDto {
  accessToken: string;
  refreshToken: string;
  user: UserProfileResponseDto;
}

export interface UserExistenceDto {
  existEmail: boolean;
  existPhone: boolean;
}
