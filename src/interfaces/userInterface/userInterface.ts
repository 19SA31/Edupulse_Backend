import mongoose, { Document, ObjectId, Types } from "mongoose";

export interface IUser extends Document {
  _id: string | ObjectId;
  name: string;
  email: string;
  phone: string;
  googleId: string;
  password: string;
  isEmailVerified: boolean;
  DOB?: Date;
  gender?: "male" | "female" | "other";
  avatar?: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  googleId?: string;
  password: string;
  isEmailVerified?: boolean;
  DOB?: Date;
  gender?: "male" | "female" | "other";
  avatar?: string;
  isBlocked: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface CreateUserType {
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
  googleId?: string;
  avatar?: string;
  isEmailVerified?: boolean;
}

export interface UserProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  DOB?: Date;
  gender?: "male" | "female" | "other";
  avatar?: string | null;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  DOB?: string;
  gender?: "male" | "female" | "other";
  avatar?: Express.Multer.File | string | null;
  cropData?: CropData | null;
}

export interface GetUserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  DOB?: Date;
  gender?: string;
  avatar?: string;
}

export interface OTPDocument extends Document {
  email: string;
  otp: string;
  createdTime: Date;
  expiresAt?: Date;
}
