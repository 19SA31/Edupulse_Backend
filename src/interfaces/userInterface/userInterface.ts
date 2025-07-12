// interfaces/userInterface/userInterface.ts
import mongoose, { Document, ObjectId, Types } from "mongoose";

// Main User interface extending Document for Mongoose
export interface IUser extends Document {
    _id: string | ObjectId;
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

// Clean User type without Document extension
export interface User {
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

// src/types/common.ts
export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Profile update data interface
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  DOB?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: Express.Multer.File | string | null; // Added string to handle filename assignment
  cropData?: CropData | null;
}

// User creation interfaces
export interface CreateUserType {
    name: string;
    email: string;
    phone: string;
    password: string;
    createdAt?: Date;
}

export interface NewUserType {
    name: string;
    email: string;
    phone: string;
    password: string;
}

// Profile data for responses
export interface UserProfileData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  DOB?: Date;
  gender?: 'male' | 'female' | 'other';
  avatar?: string | null; // Changed from string | undefined to string | null
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export interface Categories{
    
}

// Simplified user data for responses
export interface GetUserData {
    id: string;
    name: string;
    email: string;
    phone: string;
    DOB?: Date;
    gender?: string;
    avatar?: string;
}

// OTP related interface
export interface OTPDocument extends Document {
    email: string;
    otp: string;
    createdTime: Date;
    expiresAt?: Date;
}