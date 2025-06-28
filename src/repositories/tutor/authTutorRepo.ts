import { Document } from "mongoose";
import tutorModel from "../../models/Tutors";
import OtpModel from "../../models/OtpSchema";
import {
  tutorType,
  TutorProfile,
  CreateTutorType,
} from "../../interfaces/tutorInterface/tutorInterface";
import bcrypt from "bcrypt";
import BaseRepository from "../BaseRepository";
import { ITutorAuthRepository } from "../../interfaces/tutor/tutorAuthRepoInterface";

export class AuthTutorRepository
  extends BaseRepository<any>
  implements ITutorAuthRepository
{
  private _otpRepository = new BaseRepository<any>(OtpModel);

  constructor() {
    super(tutorModel);
  }

  async existTutor(
    email: string,
    phone?: string
  ): Promise<{ existEmail: boolean; existPhone: boolean }> {
    try {
      const [emailExist, phoneExist] = await Promise.all([
        this.findOne({ email }),
        phone ? this.findOne({ phone }) : Promise.resolve(null),
      ]);

      return {
        existEmail: !!emailExist,
        existPhone: phone ? !!phoneExist : false,
      };
    } catch (error) {
      console.error("Error checking if user exists:", error);
      throw new Error("Error checking user existence");
    }
  }

  async createTutor(
    userData: CreateTutorType
  ): Promise<Document<unknown, any, any> & tutorType> {
    try {
      const user = (await this.create(userData)) as Document<
        unknown,
        any,
        any
      > & tutorType;

      return user;
    } catch (error) {
      console.error("Error in creating new User", error);
      throw new Error(`Error creating user: ${(error as Error).message}`);
    }
  }

  async saveOTP(email: string, OTP: string): Promise<void> {
    try {
      console.log("INSIDE SAVEOTP, otp:", OTP);
      await this._otpRepository.create({ email, otp: OTP });
    } catch (error: any) {
      console.error("Error saving OTP:", error);
      throw new Error(`Error saving OTP: ${error.message}`);
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      const otpRecord = await this._otpRepository.findOne({ email });
      if (!otpRecord) {
        return false;
      }
      
      const isMatch = await bcrypt.compare(otp, otpRecord.otp);
      return isMatch;
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      throw new Error(`Error verifying OTP: ${error.message}`);
    }
  }

  async verifyTutor(
    email: string,
    password: string
  ): Promise<TutorProfile | null> {
    try {
      const userData = await this.findOne({ email });
      if (!userData) {
        return null;
      }

      if (userData.isBlocked) {
        throw new Error("Tutor account is blocked");
      }

      const isMatch = await bcrypt.compare(password, userData.password);
      if (!isMatch) {
        return null;
      }

      const formattedUserData: TutorProfile = {
        ...userData.toObject(),
        _id: userData._id.toString(),
      };

      return formattedUserData;
    } catch (error: any) {
      console.error("Error in tutor verification:", error);
      throw error; // Re-throw to preserve specific error messages like "blocked"
    }
  }

  async resetPassword(email: string, password: string): Promise<void> {
    try {
      const userData = await this.findOne({ email });

      if (!userData) {
        throw new Error("Email not found");
      }

      await this.update(userData._id.toString(), { password });
    } catch (error) {
      console.error("Error in reset password repo:", error);
      throw new Error("Error resetting password");
    }
  }
}