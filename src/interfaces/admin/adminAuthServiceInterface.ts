

export interface IAdminAuthServiceInterface {
    loginService(adminData:{email:string,password:string}):Promise<{success:boolean,message:string,accessToken?: string; refreshToken?: string;}>
}