import { Document } from "mongoose";
import {
  tutorType,
  TutorProfile,
  CreateTutorType,
  TutorDocs
} from "../tutorInterface/tutorInterface";

export interface ITutorAuthRepository {
  existTutor(
    email: string,
    phone?: string
  ): Promise<{ existEmail: boolean; existPhone: boolean }>;

  createTutor(
    userData: CreateTutorType
  ): Promise<Document<unknown, any, any> & tutorType>;

  saveOTP(email: string, OTP: string): Promise<void>;

  verifyOtp(email: string, otp: string): Promise<boolean>;

  verifyTutor(email: string, password: string): Promise<TutorProfile | null>;

  resetPassword(email: string, password: string): Promise<void>;

  checkVerificationStatus(id:string):Promise<TutorDocs | null>
}
