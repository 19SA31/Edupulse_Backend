export interface IAdminAuthServiceInterface {
    loginService(adminData: { email: string; password: string }): Promise<{
        isValid: boolean;
        accessToken?: string;
        refreshToken?: string;
        error?: string;
    }>;
}