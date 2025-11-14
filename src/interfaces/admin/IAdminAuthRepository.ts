// src/interfaces/admin/adminAuthRepoInterface.ts

import { AdminVerificationResultDTO } from '../../dto/admin/AdminAuthDTO';

export interface IAdminAuthRepository {
    verifyAdmin(email: string, password: string): Promise<AdminVerificationResultDTO>;
}