import { Document } from "mongoose";
import userModel from "../../models/Users";
import OtpModel from "../../models/OtpSchema";
import {
  User,
  UserProfileData,
  CreateUserType,
} from "../../interfaces/userInterface/userInterface";
import bcrypt from "bcrypt";
import BaseRepository from "../BaseRepository";
import { IAuthRepository } from "../../interfaces/user/userAuthRepoInterface";

export class AuthUserRepository
  extends BaseRepository<any>
  implements IAuthRepository
{
  private _otpRepository = new BaseRepository<any>(OtpModel);

  constructor() {
    super(userModel);
  }

  async existUser(
    email: string,
    phone?: string
  ): Promise<{ existEmail: boolean; existPhone: boolean }> {
    const [emailExist, phoneExist] = await Promise.all([
      this.findOne({ email }),
      phone ? this.findOne({ phone }) : Promise.resolve(null),
    ]);

    return {
      existEmail: !!emailExist,
      existPhone: phone ? !!phoneExist : false,
    };
  }

  async createUser(
    userData: CreateUserType
  ): Promise<Document<unknown, any, any> & User> {
    const user = (await this.create(userData)) as Document<unknown, any, any> &
      User;

    return user;
  }

  async saveOTP(email: string, OTP: string): Promise<void> {
    await this._otpRepository.create({ email, otp: OTP });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpRecord = await this._otpRepository.findOne({ email });

    if (!otpRecord) {
      throw new Error("OTP not found");
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    return isMatch;
  }

  async verifyUser(email: string, password: string): Promise<UserProfileData> {
    const userData = await this.findOne({ email });

    if (!userData) {
      throw new Error("Invalid email");
    }

    if (userData.isBlocked) {
      throw new Error("User blocked");
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }

    const formattedUserData: UserProfileData = {
      ...userData.toObject(),
      _id: userData._id.toString(),
    };

    return formattedUserData;
  }

  async resetPassword(email: string, password: string): Promise<void> {
    const userData = await this.findOne({ email });

    if (!userData) {
      throw new Error("Invalid email");
    }

    await this.update(userData._id.toString(), { password });
  }
}