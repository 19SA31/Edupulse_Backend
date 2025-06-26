
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
    success: boolean; 
    message: string; 
    accessToken?: string; 
    refreshToken?: string;
    
  }> {
    try {
      console.log("Reached login service");
  
      const loggedAdmin = await this.AuthRepository.verifyAdmin(adminData.email, adminData.password);
      
      if (!loggedAdmin.success ) {
        return { success: false, message: loggedAdmin.message }; 
      }
  
      
  
      const accessToken = jwt.sign(
        { id: "admin_id", email:"admin@gmail.com", role: "admin" },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
  
      const refreshToken = jwt.sign(
        { id: "admin_id", email:"admin@gmail.com", role: "admin" },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );
  
      return { 
        success: true, 
        message: "Login successful", 
        accessToken, 
        refreshToken,
      };
    } catch (error) {
      console.error("Error in login service:", error);
      return { success: false, message: "Error in login service" };
    }
  }
  
}
