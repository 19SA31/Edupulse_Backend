import { Document } from "mongoose";
import { 
  User, 
  UserProfileData, 
  CreateUserType 
} from "../userInterface/userInterface";
import { UserExistenceDto } from "../../dto/user/UserAuthDTO";

export interface IAuthRepository {
  existUser(email: string, phone?: string): Promise<UserExistenceDto>;
  createUser(userData: CreateUserType): Promise<Document<unknown, any, any> & User>;
  saveOTP(email: string, OTP: string): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  verifyUser(email: string, password: string): Promise<UserProfileData>;
  resetPassword(email: string, password: string): Promise<void>;
  findUserByEmail(email: string): Promise<UserProfileData | null>
}