import { Request, Response, NextFunction } from "express";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { IAdminService } from "../../interfaces/admin/IAdminService";
import { sendRejectionEmail } from "../../config/emailConfig";
import { AppError } from "../../errors/AppError";
import { sendSuccess, sendError } from "../../helper/responseHelper";

export class AdminController {
  private _AdminService: IAdminService;

  constructor(AdminServiceInstance: IAdminService) {
    this._AdminService = AdminServiceInstance;
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;
      const searchQuery = search ? String(search) : null;

      const { users, totalPages } = await this._AdminService.getAllUsers(
        skip,
        pageLimit,
        searchQuery
      );

      sendSuccess(res, "Fetch users successfully", { users, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async getTutors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;
      const searchQuery = search ? String(search) : null;

      const result = await this._AdminService.getAllTutors(
        skip,
        pageLimit,
        searchQuery
      );

      sendSuccess(res, "Fetched tutors successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async listUnlistUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.userId;
      const user = await this._AdminService.listUnlistUser(id);

      sendSuccess(res, "User updated successfully", user);
    } catch (error) {
      next(error);
    }
  }

  async listUnlistTutor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.tutorId;
      const tutor = await this._AdminService.listUnlistTutor(id);

      sendSuccess(res, "Tutor updated successfully", tutor);
    } catch (error) {
      next(error);
    }
  }

  async addCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await this._AdminService.addCourseCategory(req.body);

      sendSuccess(res, "Category created successfully", category, HTTP_statusCode.updated);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;
      const searchQuery = search ? String(search) : "";

      const { categories, totalPages } = await this._AdminService.getAllCategories(
        skip,
        pageLimit,
        searchQuery
      );

      sendSuccess(res, "Fetched categories successfully", { categories, totalPages });
    } catch (error) {
      next(error);
    }
  }

  async editCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.params.id;
      const updateData = req.body;

      const updatedCategory = await this._AdminService.updateCourseCategory(
        categoryId,
        updateData
      );

      sendSuccess(res, "Category updated successfully", updatedCategory);
    } catch (error) {
      next(error);
    }
  }

  async toggleCategoryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.params.id;
      const updatedCategory = await this._AdminService.toggleCategoryListStatus(categoryId);

      sendSuccess(res, "Category status updated successfully", updatedCategory);
    } catch (error) {
      next(error);
    }
  }

  async getTutorDocs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageLimit = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageLimit;
      const searchQuery = search ? String(search) : null;

      const result = await this._AdminService.getAllTutorDocs(
        skip,
        pageLimit,
        searchQuery
      );

      sendSuccess(res, "Fetched tutor docs successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async rejectTutor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tutorId } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim() === "") {
        throw new AppError("Rejection reason is required", HTTP_statusCode.BadRequest);
      }

      const result = await this._AdminService.rejectTutor(tutorId, reason);

      if (!result || !result.success) {
        throw new AppError(
          result?.message || "Failed to reject tutor",
          HTTP_statusCode.BadRequest
        );
      }

      const emailSent = await sendRejectionEmail(
        result.tutorEmail!,
        result.tutorName!,
        reason
      );

      if (!emailSent) {
        console.warn(`Failed to send rejection email to ${result.tutorEmail}`);
      }

      sendSuccess(res, "Tutor rejected successfully", {
        tutorId,
        reason,
        emailSent,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyTutor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tutorId } = req.params;
      const result = await this._AdminService.verifyTutor(tutorId);

      if (!result.success) {
        throw new AppError(
          result.message || "Failed to verify tutor",
          HTTP_statusCode.BadRequest
        );
      }

      sendSuccess(res, "Tutor verified successfully", result);
    } catch (error) {
      next(error);
    }
  }
}