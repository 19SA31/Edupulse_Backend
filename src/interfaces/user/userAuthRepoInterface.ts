import { Document } from "mongoose";
import { userType, UserProfile, CreateUserType } from "../userInterface/userInterface";
import { ResponseModel } from "../../models/ResponseModel"; 

export interface IAuthRepository {
    existUser(email: string, phone?: string): Promise<ResponseModel<{ existEmail: boolean; existPhone: boolean }>>;
    createUser(userData: CreateUserType): Promise<ResponseModel<Document<unknown, any, any> & userType>>;
    saveOTP(email: string, OTP: string): Promise<ResponseModel<null>>;
    verifyOtp(email: string, OTP: string): Promise<ResponseModel<{ success: boolean }>>;
    verifyUser(email: string, password: string): Promise<ResponseModel<UserProfile | null>>;
    resetPassword(email: string, password: string): Promise<ResponseModel<null>>;
}
