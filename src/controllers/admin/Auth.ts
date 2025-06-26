import { IAdminAuthServiceInterface } from "../../interfaces/admin/adminAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";

export class AuthAdminController {
  private authService: IAdminAuthServiceInterface;

  constructor(authServiceInstance: IAdminAuthServiceInterface) {
    this.authService = authServiceInstance;
  }

  async adminLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body;
      

      const adminResponse = await this.authService.loginService(data);
      

      if (!adminResponse.success) {
        
        res
          .status(HTTP_statusCode.BadRequest)
          .json({
            success: adminResponse.success,
            message: adminResponse.message,
          });
        return;
      }

      res.cookie("RefreshToken", adminResponse.refreshToken, {
        httpOnly: true, // Makes the cookie inaccessible to JavaScript
        secure: false, // Ensures the cookie is sent over HTTPS in production
        sameSite: "strict", // Protects against CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 21 days
      });
      res.cookie("AccessToken", adminResponse.accessToken, {
        httpOnly: true, // Makes the cookie inaccessible to JavaScript
        secure: false, // Ensures the cookie is sent over HTTPS in production
        sameSite: "strict", // Protects against CSRF attacks
        maxAge: 1 * 24 * 60 * 60 * 1000, // 7 days
      });

      console.log("admin logged in successfully");
      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: "Admin logged in",
        accessToken: adminResponse.accessToken,
        refreshToken: adminResponse.refreshToken,
      });
    } catch (error) {
      console.error("Error in login: ", error);
      res.status(HTTP_statusCode.InternalServerError).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async logoutAdmin(req: Request, res: Response): Promise<void> {
    try {
      
      res.clearCookie("refreshToken", {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      });
      res
        .status(HTTP_statusCode.OK)
        .json({ message: "You have been logged Out Successfully" });
    } catch (error: any) {
      res.status(HTTP_statusCode.InternalServerError).json({
        message: `Internal server error : ${error}`,
      });
    }
  }
}
