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

// Profile update data interface
export interface UpdateProfileData {
    name?: string;
    phone?: string;
    DOB?: string | Date;
    gender?: 'male' | 'female' | 'other';
    avatar?: string;
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
    phone: string;
    DOB?: Date;
    gender?: 'male' | 'female' | 'other';
    avatar?: string;
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