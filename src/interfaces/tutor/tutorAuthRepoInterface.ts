import { Document } from "mongoose";
import { tutorType, TutorProfile, CreateTutorType } from "../tutorInterface/tutorInterface";
import { ResponseModel } from "../../models/ResponseModel"; 


export interface ITutorAuthRepository {
    existTutor(email: string, phone?: string): Promise<ResponseModel<{ existEmail: boolean; existPhone: boolean }>>;
    createTutor(userData: CreateTutorType): Promise<ResponseModel<Document<unknown, any, any> & tutorType>>;
    saveOTP(email: string, OTP: string): Promise<ResponseModel<null>>;
    verifyOtp(email: string, OTP: string): Promise<ResponseModel<{ success: boolean }>>;
    verifyTutor(email: string, password: string): Promise<ResponseModel<TutorProfile | null>>;
    resetPassword(email: string, password: string): Promise<ResponseModel<null>>;
}