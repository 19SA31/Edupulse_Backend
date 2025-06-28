import { IAdminAuthServiceInterface } from "../../interfaces/admin/adminAuthServiceInterface"; 
import { IAdminAuthRepository } from "../../interfaces/admin/adminAuthRepoInterface";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export class AuthAdminService implements IAdminAuthServiceInterface {
  private AuthRepository: IAdminAuthRepository;

  constructor(AuthRepository: IAdminAuthRepository) {
    this.AuthRepository = AuthRepository;
  }

  async loginService(adminData: { email: string; password: string }): Promise<{
    isValid: boolean;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }> {
    try {
      console.log("Reached login service");
  
      const verificationResult = await this.AuthRepository.verifyAdmin(adminData.email, adminData.password);
      console.log("verification result in service",verificationResult)
      if (!verificationResult.isValid) {
        return { 
          isValid: false, 
          error: verificationResult.error 
        }; 
      }
  
      const accessToken = jwt.sign(
        { id: "admin_id", email: "admin@gmail.com", role: "admin" },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
  
      const refreshToken = jwt.sign(
        { id: "admin_id", email: "admin@gmail.com", role: "admin" },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );
  
      return { 
        isValid: true,
        accessToken, 
        refreshToken,
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