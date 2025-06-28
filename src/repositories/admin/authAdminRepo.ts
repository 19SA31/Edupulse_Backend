import { Document, Model } from "mongoose";
import adminModel from '../../models/Admin'
import { IAdminAuthRepository } from "../../interfaces/admin/adminAuthRepoInterface"; 
import BaseRepository from "../BaseRepository";

export class AuthAdminRepository extends BaseRepository<any> implements IAdminAuthRepository {
    
    constructor() {
        super(adminModel); 
    }

    async verifyAdmin(email: string, password: string): Promise<{
        isValid: boolean;
        admin?: any;
        error?: string;
    }> {
        try {
            const userData = await this.findOne({ email });
            if (!userData) {
                return {
                    isValid: false,
                    error: "Invalid email address"
                };
            }

            const isMatch = password === userData.password;
            if (!isMatch) {
                return {
                    isValid: false,
                    error: "Invalid password"
                };
            }

            return {
                isValid: true,
                admin: userData
            };
        } catch (error: any) {
            return {
                isValid: false,
                error: `Login error: ${error.message}`
            };
        }
    }
}