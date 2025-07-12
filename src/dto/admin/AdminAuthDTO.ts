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

// Internal domain model (what your service/repo works with)
export interface AdminDomain {
  _id: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Repository response DTO
export interface AdminVerificationResultDTO {
  isValid: boolean;
  admin?: AdminDomain;
  error?: string;
}

// Service response DTO
export interface AdminLoginServiceResultDTO {
  isValid: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  admin?: AdminDomain;
}
