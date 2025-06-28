import { Document } from "mongoose";
import {
  userType,
  UserProfile,
  CreateUserType,
} from "../userInterface/userInterface";

export interface IAuthRepository {
  existUser(
    email: string,
    phone?: string
  ): Promise<{ existEmail: boolean; existPhone: boolean }>;
  createUser(
    userData: CreateUserType
  ): Promise<Document<unknown, any, any> & userType>;
  saveOTP(email: string, OTP: string): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  verifyUser(email: string, password: string): Promise<UserProfile>;
  resetPassword(email: string, password: string): Promise<void>;
}
