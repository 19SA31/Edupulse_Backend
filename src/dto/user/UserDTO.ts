
import { CropData } from '../../interfaces/userInterface/userInterface';


export interface UpdateProfileRequestDTO {
  name?: string;
  phone?: string;
  DOB?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: Express.Multer.File | string | null;
  cropData?: string; 
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
  DOB?: string; 
  gender?: 'male' | 'female' | 'other';
  avatar?: string | null;
  isBlocked?: boolean;
  createdAt?: string; 
  updatedAt?: string; 
  lastLogin?: string; 
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


export interface ValidationErrorDTO {
  field: string;
  message: string;
}

export interface ValidationResultDTO {
  isValid: boolean;
  errors: ValidationErrorDTO[];
}


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