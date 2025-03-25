import { GetUserData } from '../userInterface/userInterface'



export interface IAuthService {
    signUp(userData: {name?: string;email: string;phone?: string;password?: string; isForgot?:boolean;}): Promise<{success:boolean}>;
    otpCheck(userData: { name?: string; email: string; phone?: string; password?:string; otp:string}): Promise<{success:boolean}>;
    loginService(userData:{email:string,password:string}):Promise<{success:boolean,message:string,accessToken?: string; refreshToken?: string; user?:GetUserData}>
    resetPasswordService(userData:{email:string,password:string}):Promise<{success:boolean,message:string}>
 };