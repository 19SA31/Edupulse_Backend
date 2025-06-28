import { IAdminAuthServiceInterface } from "../../interfaces/admin/adminAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";
import { ResponseModel } from "../../models/ResponseModel";

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
      
      const serviceResult = await this.authService.loginService(data);
      
      if (!serviceResult.isValid) {
        const response = new ResponseModel(false, serviceResult.error || "Login failed");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      // Set cookies for successful login
      res.cookie("RefreshToken", serviceResult.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.cookie("AccessToken", serviceResult.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      });

      console.log("admin logged in successfully");
      
      const response = new ResponseModel(true, "Admin logged in successfully", {
        accessToken: serviceResult.accessToken,
        refreshToken: serviceResult.refreshToken,
      });
      
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      console.error("Error in login: ", error);
      
      let response: ResponseModel;
      
      if (error.message === "Invalid email or password") {
        response = new ResponseModel(false, "Invalid email or password");
        res.status(HTTP_statusCode.BadRequest).json(response);
      } else {
        response = new ResponseModel(false, "Internal Server Error");
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }

  async logoutAdmin(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("RefreshToken", {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      });
      
      res.clearCookie("AccessToken", {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
      });
      
      const response = new ResponseModel(true, "You have been logged out successfully");
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      const response = new ResponseModel(false, `Internal server error: ${error.message}`);
      res.status(HTTP_statusCode.InternalServerError).json(response);
    }
  }
}