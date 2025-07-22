import { IAdminAuthServiceInterface } from "../../interfaces/admin/adminAuthServiceInterface";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { Request, Response, NextFunction } from "express";
import { ResponseModel } from "../../models/ResponseModel";
import { AdminAuthMapper } from "../../mappers/admin/AdminAuthMapper";

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
      const { email, password } = req.body;

      if (!email || !password) {
        const response = new ResponseModel(false, "Email and password are required");
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      const serviceInput = AdminAuthMapper.mapLoginRequestToService({ email, password });
      
      const serviceResult = await this.authService.loginService(serviceInput);
      
      if (!serviceResult.isValid) {
        const responseDTO = AdminAuthMapper.mapServiceResultToResponse(serviceResult, false);
        const response = new ResponseModel(false, responseDTO.message);
        res.status(HTTP_statusCode.BadRequest).json(response);
        return;
      }

      res.cookie("RefreshToken", serviceResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.cookie("AccessToken", serviceResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      });

      console.log("admin logged in successfully");
      
      const responseDTO = AdminAuthMapper.mapServiceResultToResponse(serviceResult, true);
      const response = new ResponseModel(true, responseDTO.message, {
        accessToken: responseDTO.accessToken,
        refreshToken: responseDTO.refreshToken,
        admin: responseDTO.admin
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
      
      const responseDTO = AdminAuthMapper.mapLogoutResponse();
      const response = new ResponseModel(true, responseDTO.message);
      res.status(HTTP_statusCode.OK).json(response);
    } catch (error: any) {
      const response = new ResponseModel(false, `Internal server error: ${error.message}`);
      res.status(HTTP_statusCode.InternalServerError).json(response);
    }
  }
}