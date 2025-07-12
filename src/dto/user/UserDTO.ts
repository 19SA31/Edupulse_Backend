
import { CropData } from '../../interfaces/userInterface/userInterface';

// Request DTOs - Data coming from client
export interface UpdateProfileRequestDTO {
  name?: string;
  phone?: string;
  DOB?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: Express.Multer.File | string | null;
  cropData?: string; // JSON string from form data
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  DOB?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: Express.Multer.File | string | null;
  cropData?: CropData|null;
}

export interface CreateUserRequestDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

// Response DTOs - Data going to client
export interface UserProfileResponseDTO {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  DOB?: string; // ISO string format for client
  gender?: 'male' | 'female' | 'other';
  avatar?: string | null;
  isBlocked?: boolean;
  createdAt?: string; // ISO string format for client
  updatedAt?: string; // ISO string format for client
  lastLogin?: string; // ISO string format for client
}

export interface UserSummaryDTO {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface UpdateProfileResponseDTO {
  user: UserProfileResponseDTO;
}

export interface GetUserProfileResponseDTO {
  user: UserProfileResponseDTO;
}

// Internal DTOs - Data used within services
export interface UserDatabaseDTO {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  DOB?: Date;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface UpdateUserDatabaseDTO {
  name?: string;
  phone?: string;
  DOB?: Date;
  gender?: 'male' | 'female' | 'other';
  avatar?: string | null;
}

// Validation DTOs
export interface ValidationErrorDTO {
  field: string;
  message: string;
}

export interface ValidationResultDTO {
  isValid: boolean;
  errors: ValidationErrorDTO[];
}

// File upload DTOs
export interface FileUploadDTO {
  file: Express.Multer.File;
  cropData?: CropData;
}

export interface FileUploadResponseDTO {
  fileName: string;
  url: string;
  size: number;
  mimeType: string;
}