import { Document } from "mongoose";
import { userType,UserProfile } from "../userInterface/userInterface";

export interface IAuthRepository {
    existUser(email:string,phone?:string): Promise<{ existEmail: boolean; existPhone: boolean }>;
    createUser(userData: userType): Promise<Document>;
    saveOTP(email: string, OTP: string): Promise<void> 
    verifyOtp(email: string,OTP:string): Promise<{success:boolean}> 
    verifyUser(email: string,password:string): Promise<{success:boolean,message:string;data:UserProfile|null}> 
    resetPassword(email:string,password:string):Promise<{success:boolean,message:string}>
 };