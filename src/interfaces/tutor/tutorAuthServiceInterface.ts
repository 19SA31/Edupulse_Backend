import { GetTutorData } from "../tutorInterface/tutorInterface"; 

export interface ITutorAuthInterface {
    signUp(tutorData: {name?: string;email: string;phone?: string;password?: string; isForgot?:boolean;}): Promise<{success:boolean}>;
    otpCheck(tutorData: { name?: string; email: string; phone?: string; password?:string; otp:string}): Promise<{success:boolean}>;
    loginService(tutorData:{email:string,password:string}):Promise<{success:boolean,message:string,accessToken?: string; refreshToken?: string; tutor?:GetTutorData}>
    resetPasswordService(tutorData:{email:string,password:string}):Promise<{success:boolean,message:string}>
}