
import { Document, Model } from "mongoose";
import adminModel from '../../models/Admin';
import { IAdminAuthRepository } from "../../interfaces/admin/adminAuthRepoInterface";
import { AdminVerificationResultDTO } from "../../dto/admin/AdminAuthDTO";
import { AdminAuthMapper } from "../../mappers/admin/AdminAuthMapper";
import BaseRepository from "../BaseRepository";

export class AuthAdminRepository extends BaseRepository<any> implements IAdminAuthRepository {
    
    constructor() {
        super(adminModel); 
    }

    async verifyAdmin(email: string, password: string): Promise<AdminVerificationResultDTO> {
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

            // Map model to domain object
            const adminDomain = AdminAuthMapper.mapModelToDomain(userData);

            return {
                isValid: true,
                admin: adminDomain
            };
        } catch (error: any) {
            return {
                isValid: false,
                error: `Login error: ${error.message}`
            };
        }
    }
}