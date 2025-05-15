import { Request, Response } from "express";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { IAdminService } from "../../interfaces/admin/adminServiceInterface";

export class AdminController {
  private AdminService: IAdminService;

  constructor(AdminServiceInstance: IAdminService) {
    this.AdminService = AdminServiceInstance;
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const { users, totalPages } = await this.AdminService.getAllUsers(
        skip,
        pageLimit,
        search
      );

      res.status(HTTP_statusCode.OK).json({
        message: "Fetch users successfully",
        response: { users, totalPages },
      });
    } catch (error: any) {
      console.error("Error in getUsers controller:", error.message);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json({
          message: "An unexpected error occurred",
          error: error.message,
        });
    }
  }
  async getTutors(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);

      const skip = (pageNumber - 1) * pageLimit;

      const response = await this.AdminService.getAllTutors(
        skip,
        pageLimit,
        search
      );

      res
        .status(HTTP_statusCode.OK)
        .json({ message: "Fetched tutors successfully", response });
    } catch (error: any) {
      console.error("Error in gettutors controller:", error.message);

      res
        .status(HTTP_statusCode.InternalServerError)
        .json({
          message: "An unexpected error occurred",
          error: error.message,
        });
    }
  }

  async listUnlistUser(req: Request, res: Response): Promise<void> {
    try {
      console.log("listing user admin contrlr");
      const id = req.params.userId;

      const response = await this.AdminService.listUnlistUser(id);

      console.log("user status edited", response);

      res
        .status(HTTP_statusCode.OK)
        .json({ message: "user updated successfully", response });
    } catch (error: any) {
      console.error("Error in listunlistuser controller:", error.message);

      if (error.message === "Something went wrong while creating the user.") {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: "Something went wrong while updating the user." });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({
            message: "An unexpected error occurred",
            error: error.message,
          });
      }
    }
  }

  async listUnlistTutor(req: Request, res: Response): Promise<void> {
    try {
      console.log("listing tutor in admin contrlr");
      const id = req.params.tutorId;

      const response = await this.AdminService.listUnlistTutor(id);

      console.log("Tutor status edited", response);

      res
        .status(HTTP_statusCode.OK)
        .json({ message: "Tutor updated successfully", response });
    } catch (error: any) {
      console.error("Error in listunlisttutor controller:", error.message);

      if (error.message === "Something went wrong while creating the user.") {
        res
          .status(HTTP_statusCode.BadRequest)
          .json({ message: "Something went wrong while updating the user." });
      } else {
        res
          .status(HTTP_statusCode.InternalServerError)
          .json({
            message: "An unexpected error occurred",
            error: error.message,
          });
      }
    }
  }
}
