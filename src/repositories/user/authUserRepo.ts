import { Document, Model } from "mongoose";
import { ResponseModel } from "../../models/ResponseModel";
import userModel from "../../models/Users";
import OtpModel from "../../models/OtpSchema";
import { userType, UserProfile, CreateUserType } from "../../interfaces/userInterface/userInterface";
import bcrypt from 'bcrypt';
import BaseRepository from "../BaseRepository";
import { IAuthRepository } from "../../interfaces/user/userAuthRepoInterface";
import { Messages } from "../../enums/messages";

export class AuthUserRepository extends BaseRepository<any> implements IAuthRepository {
    private _otpRepository = new BaseRepository<any>(OtpModel); 

    constructor() {
        super(userModel); 
    }

    async existUser(email: string, phone?: string): Promise<ResponseModel<{ existEmail: boolean; existPhone: boolean }>> {
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

    async createUser(userData: CreateUserType): Promise<ResponseModel<Document<unknown, any, any> & userType>> {
        try {
            const user = await this.create(userData) as Document<unknown, any, any> & userType;

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
            await this._otpRepository.create({ email, otp: OTP });
            return new ResponseModel(true, Messages.OTP_SAVED);
        } catch (error: any) {
            return new ResponseModel(false, `${Messages.ERROR_SAVING_OTP}: ${error.message}`);
        }
    }

    async verifyOtp(email: string, otp: string): Promise<ResponseModel<{ success: boolean }>> {
        try {
            const otpRecord = await this._otpRepository.findOne({ email });
            if (!otpRecord) {
                return new ResponseModel(false, Messages.OTP_NOT_FOUND, { success: false });
            }
            const isMatch = await bcrypt.compare(otp, otpRecord.otp);
            return new ResponseModel(true, Messages.OTP_VERIFIED, { success: isMatch });
        } catch (error: any) {
            return new ResponseModel(false, `${Messages.ERROR_VERIFYING_OTP}: ${error.message}`, { success: false });
        }
    }

    async verifyUser(email: string, password: string): Promise<ResponseModel<UserProfile | null>> {
        try {
            const userData = await this.findOne({ email });
            if (!userData) {
                return new ResponseModel(false, Messages.INVALID_EMAIL, null);
            }

            const isMatch = await bcrypt.compare(password, userData.password);
            if (!isMatch) {
                return new ResponseModel(false, Messages.INVALID_PASSWORD, null);
            }

            const formattedUserData: UserProfile = {
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
