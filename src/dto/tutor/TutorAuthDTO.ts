export interface SendOtpRequestDTO {
  email: string;
  phone?: string;
  isForgot?: boolean;
}

export interface SendOtpResponseDTO {
  success: boolean;
  message: string;
}

export interface VerifyOtpRequestDTO {
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  otp: string;
  isForgot?: boolean;
}

export interface VerifyOtpResponseDTO {
  success: boolean;
  message: string;
}

export interface TutorLoginRequestDTO {
  email: string;
  password: string;
}


export interface TutorDataDTO {
  id: string;
  name: string;
  email: string;
  phone: string; 
  DOB: Date;
  gender?: 'male' | 'female' | 'other';
  avatar?: string | null; 
  designation?: string;
  about?: string;
  isVerified: boolean;
  verificationStatus: 'not_submitted'|'pending' | 'approved' | 'rejected';
}

export interface TutorLoginResponseDTO {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tutor: TutorDataDTO;
  };
}

export interface ResetPasswordRequestDTO {
  email: string;
  password: string;
}

export interface ResetPasswordResponseDTO {
  success: boolean;
  message: string;
}

export interface LogoutResponseDTO {
  success: boolean;
  message: string;
}

export interface SignUpServiceDTO {
  email: string;
  phone?: string;
  isForgot?: boolean;
}

export interface OtpCheckServiceDTO {
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  otp: string;
  isForgot?: boolean;
}

export interface LoginServiceDTO {
  email: string;
  password: string;
}

export interface LoginServiceResponseDTO {
  accessToken: string;
  refreshToken: string;
  tutor: TutorDataDTO;
}

export interface ResetPasswordServiceDTO {
  email: string;
  password: string;
}