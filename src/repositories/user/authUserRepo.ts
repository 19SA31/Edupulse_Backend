import userModel from "../../models/Users";
import OtpModel from "../../models/OtpSchema";
import { userType,UserProfile } from "../../interfaces/userInterface/userInterface";
import mongoose, { Document, ObjectId } from "mongoose";
import { IAuthRepository } from "../../interfaces/user/userAuthRepoInterface";
import bcrypt from  'bcrypt'

const ObjectId = mongoose.Types.ObjectId;

export class AuthRepository implements IAuthRepository {

  
  async existUser(
    email: string,
    phone?: string
  ): Promise<{ existEmail: boolean; existPhone: boolean }> {
    try {
      let existEmail = true;
      let existPhone = true;

      const emailExist = await userModel.findOne({ email: email });
      if (!emailExist) {
        existEmail = false;
      }

      const phoneExist = await userModel.findOne({ phone: phone });
      if (!phoneExist) {
        existPhone = false;
      }

      return { existEmail, existPhone };
    } catch (error) {
      console.error("Error checking if user exists:", error);
      throw new Error("Error checking if user exists");
    }
  }
  async createUser(userData: userType): Promise<Document> {
    try {
      console.log("user data", userData);

      const newUser = new userModel(userData);
      return await newUser.save();
    } catch (error: any) {
      console.log("Error in creating new User", error);
      throw new Error(`Error creating user : ${error.message}`);
    }
  }
  async saveOTP(email: string, OTP: string): Promise<void> {
    try {
      const newOtp = new OtpModel({
        email,
        otp: OTP,
      });
      await newOtp.save();
    } catch (error) {
      console.error("Error in saveOTP:", error);
      throw error;
    }
  }
  async verifyOtp(email: string, otp: string): Promise<{ success: boolean }> {
    try {
      const emailExist = await OtpModel.findOne({ email: email });
      if (!emailExist) {
        return { success: false };
      }
      const isMatch = await bcrypt.compare(otp, emailExist.otp);
      if (!isMatch) {
        return { success: false }; 
      }
      return { success: true };
    } catch (error) {
      console.log("Error verifying OTP:", error);
      return { success: false };
    }
  }
  async verifyUser(email: string, password: string): Promise<{ success: boolean; message: string; data: UserProfile | null }> {
    try {
      console.log("inside verify user: ", email, password);
      const userData = await userModel.findOne({ email: email }).lean();
  
      if (!userData) {
        return { success: false, message: "invalid email", data: null }; 
      }
  
      const isMatch = await bcrypt.compare(password, userData.password);
      if (!isMatch) {
        return { success: false, message: "invalid password", data: null }; 
      }
  
      const formattedUserData: UserProfile = { 
        ...userData, 
        _id: userData._id.toString(), 
      };
  
      return { success: true, message: "login success", data:formattedUserData };
    } catch (error) {
      console.log("Error verifying login:", error);
      return { success: false, message: "error in login", data: null }; 
    }
  }
  

  async resetPassword(email: string, password: string): Promise<{ success: boolean; message: string; }> {
    try {
      console.log("inside resetpass repo",email,password)

      const userData = await userModel.findOne({ email: email });
      console.log("emailexist:",userData)
      if (userData===null) {
        return { success: false ,message:"invalid email"};
      }
      await userModel.updateOne({ email: email }, { $set: { password: password } });
      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      console.error("Error in reset password repo: ",error)
      return {success:false,message:"error in resetpassword repo"}
    }
  }
}
