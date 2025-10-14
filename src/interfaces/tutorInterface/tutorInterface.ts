import mongoose, { Document, ObjectId, Types } from "mongoose";

export interface Tutor extends Document {
  _id: string | ObjectId |Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  DOB?: Date;
  gender?: "male" | "female" | "other";
  avatar?: string;
  designation?: string;
  about?: string;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface tutorType {
  name?: string;
  email: string;
  phone?: string;
  password: string;
  createdAt: Date;
}

export interface CreateTutorType {
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
}

export interface TutorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  DOB: Date;
  gender?: "male" | "female" | "other";
  avatar?: string | null;
  designation?: string;
  about?: string;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: Date;
  __v?: number;
}

export interface tutorProfileData {
  _id: string | ObjectId;
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

export interface GetTutorData {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  verificationStatus: "not_submitted" | "pending" | "approved" | "rejected";
}
export interface GetTutorDataLogin {
  id: string;
  name: string;
  email: string;
  phone: string;
  DOB: Date;
  gender?: "male" | "female" | "other";
  avatar?: string | null;
  designation?: string;
  about?: string;
  isVerified: boolean;
  verificationStatus: "not_submitted" | "pending" | "approved" | "rejected";
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
  designation?: string;
  about?: string;
  gender?: "male" | "female" | "other";
  avatar?: Express.Multer.File | string | null;
  cropData?: CropData | null;
}

export interface TutorProfileData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  DOB?: Date;
  designation?: string;
  about?: string;
  gender?: "male" | "female" | "other";
  avatar?: string | null;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export interface OTPDocument {
  email: string;
  otp: string;
  createdTime: Date;
}

export interface TutorDocs extends Document {
  _id: string | ObjectId;
  tutorId: string | ObjectId;
  avatar: string;
  degree: string;
  aadharFront: string;
  aadharBack: string;
  verificationStatus: "not_submitted" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionCount?: number
}

export interface DocumentFiles {
  avatar: Express.Multer.File;
  degree: Express.Multer.File;
  aadharFront: Express.Multer.File;
  aadharBack: Express.Multer.File;
}

export interface VerificationDocuments {
  avatar: File;
  degree: File;
  aadharFront: File;
  aadharBack: File;
  email?: string;
  phone?: string;
}

export interface TutorVerificationData {
  tutorId: string;
  avatar: string;
  degree: string;
  aadharFront: string;
  aadharBack: string;
}

export interface UpdateVerificationStatus {
  verificationStatus: "approved" | "rejected";
  rejectionReason?: string;
  rejectionCount?: Number
}

export interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface VerificationStatusData {
  status: "pending" | "approved" | "rejected" | "not_submitted";
  tutorId: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  rejectionCount?: Number
}

export interface VerificationDocumentsData {
  verificationId: string;
  tutorId: string;
  documents: {
    avatar: string;
    degree: string;
    aadharFront: string;
    aadharBack: string;
  };
  verificationStatus: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  rejectionCount?: Number
}

export interface VerificationSubmissionData {
  verificationId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
}

export interface ListingTutor {
  tutorId: string;
  name: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
}

export { TutorSlot, Slots, SlotDuration } from "../../models/TutorSlotsModel";


