// src/interfaces/admin/adminAuthServiceInterface.ts

import { AdminLoginRequestDTO, AdminLoginServiceResultDTO } from '../../dto/admin/AdminAuthDTO';

export interface IAdminAuthServiceInterface {
    loginService(adminData: AdminLoginRequestDTO): Promise<AdminLoginServiceResultDTO>;
}

