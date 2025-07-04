import mongoose, { ObjectId } from "mongoose";

export interface ITutor extends Document {
    _id: string | ObjectId;
    name: string;
    email: string;
    phone: string;
    password: string;
    DOB?: Date;
    gender?: 'male' | 'female' | 'other';
    avatar?: string;
    isBlocked: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
}


export interface tutorType{
  name?: string;  
  email: string;
  phone?: string; 
  password: string;
  createdAt: Date;
};


export interface ITutorDocs extends Document {
  tutorId: string | ObjectId;
  degree: string;
  aadharFront: string;
  aadharBack: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

export interface tutorProfileData {
  _id: string | ObjectId ;
  userId: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  createdAt?: string | Date;
  DOB: string | Date;
  address: string;
  isBlocked: boolean;
  __v?: number;
  
}
export interface TutorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: Date;
  __v?: number;
}

export interface GetTutorData {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

export interface OTPDocument {
  email:string
  otp:string
  createdTime: Date
}

export interface CreateTutorType  {
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
}

export interface VerificationDocuments {
  degree: File;
  aadharFront: File;
  aadharBack: File;
  email?: string;
  phone?: string;
}

export interface TutorVerificationData {
  tutorId: string;
  degree: string;
  aadharFront: string;
  aadharBack: string;
}

export interface UpdateVerificationStatus {
  verificationStatus: 'approved' | 'rejected';
  rejectionReason?: string;
}
