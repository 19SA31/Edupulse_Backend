export interface AdminLoginRequestDTO {
  email: string;
  password: string;
}

export interface AdminLoginResponseDTO {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AdminLogoutResponseDTO {
  message: string;
}


export interface AdminDomain {
  _id: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface AdminVerificationResultDTO {
  isValid: boolean;
  admin?: AdminDomain;
  error?: string;
}

export interface AdminLoginServiceResultDTO {
  isValid: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  admin?: AdminDomain;
}
