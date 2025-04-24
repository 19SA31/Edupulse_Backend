import { Document, Model } from "mongoose";
import { ResponseModel } from "../../models/ResponseModel";
import tutorModel from "../../models/Tutors";
import OtpModel from "../../models/OtpSchema";
import { tutorType, TutorProfile, CreateTutorType } from "../../interfaces/tutorInterface/tutorInterface";
import bcrypt from 'bcrypt';
import BaseRepository from "../BaseRepository";
import { ITutorAuthRepository } from "../../interfaces/tutor/tutorAuthRepoInterface";
import { Messages } from "../../enums/messages";
import { Console } from "console";

export class AuthTutorRepository extends BaseRepository<any> implements ITutorAuthRepository {
    private _otpRepository = new BaseRepository<any>(OtpModel); 

    constructor() {
        super(tutorModel); 
    }

    async existTutor(email: string, phone?: string): Promise<ResponseModel<{ existEmail: boolean; existPhone: boolean }>> {
        try {
            const [emailExist, phoneExist] = await Promise.all([
                this.findOne({ email }),
                phone ? this.findOne({ phone }) : Promise.resolve(null)
            ]);

            return {
                success: true,
                message: Messages.USER_EXISTENCE_SUCCESS,
                data: {
                    existEmail: !!emailExist,
                    existPhone: phone ? !!phoneExist : false
                }
            };
        } catch (error) {
            console.error("Error checking if user exists:", error);
            return {
                success: false,
                message: Messages.ERROR_CHECKING_USER,
                data: { existEmail: false, existPhone: false }
            };
        }
    }

    async createTutor(userData: CreateTutorType): Promise<ResponseModel<Document<unknown, any, any> & tutorType>> {
        try {
            const user = await this.create(userData) as Document<unknown, any, any> & tutorType;

            return {
                success: true,
                message: Messages.USER_CREATED,
                data: user
            };
        } catch (error) {
            console.error("Error in creating new User", error);
            return {
                success: false,
                message: `${Messages.ERROR_CREATING_USER}: ${(error as Error).message}`,
                data: null
            };
        }
    }

    async saveOTP(email: string, OTP: string): Promise<ResponseModel> {
        try {
            console.log("INSIDE SAVEOTP, otp:",OTP)
            await this._otpRepository.create({ email, otp: OTP });
            return new ResponseModel(true, Messages.OTP_SAVED);
        } catch (error: any) {
            return new ResponseModel(false, `${Messages.ERROR_SAVING_OTP}: ${error.message}`);
        }
    }

    async verifyOtp(email: string, otp: string): Promise<ResponseModel<{ success: boolean }>> {
        try {
            console.log("INSIDE verifyotp repo ,otp:",otp)
            const otpRecord = await this._otpRepository.findOne({ email });
            if (!otpRecord) {
                return new ResponseModel(false, Messages.OTP_NOT_FOUND, { success: false });
            }
            const isMatch = await bcrypt.compare(otp, otpRecord.otp);
            console.log("verify otp repo otp match:",isMatch)
            return new ResponseModel(isMatch, isMatch?Messages.OTP_VERIFIED:Messages.OTP_VERIFICATION_FAILED, { success: isMatch });
        } catch (error: any) {
            return new ResponseModel(false, `${Messages.ERROR_VERIFYING_OTP}: ${error.message}`, { success: false });
        }
    }

    async verifyTutor(email: string, password: string): Promise<ResponseModel<TutorProfile | null>> {
        try {
            const userData = await this.findOne({ email });
            if (!userData) {
                return new ResponseModel(false, Messages.INVALID_EMAIL, null);
            }

            const isMatch = await bcrypt.compare(password, userData.password);
            if (!isMatch) {
                return new ResponseModel(false, Messages.INVALID_PASSWORD, null);
            }

            const formattedUserData: TutorProfile = {
                ...userData.toObject(),
                _id: userData._id.toString()
            };

            return new ResponseModel(true, Messages.LOGIN_SUCCESS, formattedUserData);
        } catch (error: any) {
            return new ResponseModel(false, `${Messages.ERROR_LOGIN}: ${error.message}`, null);
        }
    }

    async resetPassword(email: string, password: string): Promise<ResponseModel<null>> {
        try {
            const userData = await this.findOne({ email });

            if (!userData) {
                return {
                    success: false,
                    message: Messages.INVALID_EMAIL,
                    data: null
                };
            }

            await this.update(userData._id.toString(), { password });

            return {
                success: true,
                message: Messages.PASSWORD_UPDATED,
                data: null
            };
        } catch (error) {
            console.error("Error in reset password repo:", error);
            return {
                success: false,
                message: Messages.ERROR_RESET_PASSWORD,
                data: null
            };
        }
    }
}
