import { IAdminAuthServiceInterface } from "../../interfaces/admin/IAdminAuthServiceInterface";
import { IAdminAuthRepository } from "../../interfaces/admin/IAdminAuthRepository";
import { AdminLoginRequestDTO, AdminLoginServiceResultDTO } from "../../dto/admin/AdminAuthDTO";
import { AdminAuthMapper } from "../../mappers/admin/AdminAuthMapper";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export class AuthAdminService implements IAdminAuthServiceInterface {
  private AuthRepository: IAdminAuthRepository;

  constructor(AuthRepository: IAdminAuthRepository) {
    this.AuthRepository = AuthRepository;
  }

  async loginService(adminData: AdminLoginRequestDTO): Promise<AdminLoginServiceResultDTO> {
    try {
      
      const verificationResult = await this.AuthRepository.verifyAdmin(
        adminData.email, 
        adminData.password
      );
      
      if (!verificationResult.isValid) {
        return {
          isValid: false,
          error: verificationResult.error
        };
      }

      
      const tokenPayload = {
        id: verificationResult.admin?._id,
        email: verificationResult.admin?.email,
        role: "admin"
      };

      const accessToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return {
        isValid: true,
        accessToken,
        refreshToken,
        admin: verificationResult.admin
      };
    } catch (error) {
      console.error("Error in login service:", error);
      return {
        isValid: false,
        error: "Error in login service"
      };
    }
  }
}