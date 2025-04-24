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
      console.log("inside login: ", data);

      const response = await this.authService.loginService(data);
      console.log("adminlogin response: ", response);

      if (!response.success) {
        console.log("admin login failed");
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ success: response.success, message: response.message });
        return;
      }

      console.log("admin logged in successfully");
      res.status(HTTP_statusCode.OK).json({
        success: true,
        message: "Admin logged in",
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,

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
