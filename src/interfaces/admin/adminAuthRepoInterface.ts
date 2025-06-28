export interface IAdminAuthRepository {
    verifyAdmin(email: string, password: string): Promise<{
        isValid: boolean;
        admin?: any; // or your specific admin type
        error?: string;
    }>;
}