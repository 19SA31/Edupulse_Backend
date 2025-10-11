import { Request, Response, NextFunction } from "express";
import { ITutorService } from "../../interfaces/tutor/ITutorService";
import { TutorMapper } from "../../mappers/tutor/TutorMapper";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { AppError } from "../../errors/AppError";
import { sendSuccess } from "../../helper/responseHelper";
import {
  CropData,
  UpdateProfileData,
} from "../../interfaces/tutorInterface/tutorInterface";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class TutorController {
  private _tutorService: ITutorService;

  constructor(tutorService: ITutorService) {
    this._tutorService = tutorService;
  }

  private getUserId(req: AuthRequest): string {
    if (!req.user?.id) {
      throw new AppError("User not authenticated", HTTP_statusCode.Unauthorized);
    }
    return req.user.id;
  }

  getTutorProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const result = await this._tutorService.getTutorProfile(userId);
      sendSuccess(res, "Tutor profile retrieved successfully", result.tutor);
    } catch (error) {
      next(error);
    }
  };

  updateTutorProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const avatarFile = req.file;
      
      const cropData = this.parseCropData(req.body.cropData);
      this.validateAvatarFile(avatarFile, cropData);
      
      const updateData = this.buildUpdateData(req.body, avatarFile, cropData);

      if (Object.keys(updateData).length === 0) {
        throw new AppError("No data provided for update", HTTP_statusCode.BadRequest);
      }

      const result = await this._tutorService.updateProfile(userId, updateData);
      sendSuccess(res, "Tutor profile updated successfully", result);
    } catch (error) {
      next(error);
    }
  };

  submitVerificationDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { email, phone } = req.body;

      if (!files?.avatar || !files?.degree || !files?.aadharFront || !files?.aadharBack) {
        throw new AppError(
          "All document files are required (avatar, degree, aadharFront, aadharBack)",
          HTTP_statusCode.BadRequest
        );
      }

      if (!email && !phone) {
        throw new AppError("Email or phone number is required", HTTP_statusCode.BadRequest);
      }

      const requestDTO = TutorMapper.mapSubmitVerificationDocumentsRequest(req);
      const result = await this._tutorService.submitVerificationDocuments(requestDTO);

      sendSuccess(res, "Verification documents submitted successfully", result.data);
    } catch (error) {
      next(error);
    }
  };

  getVerificationDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tutorId } = req.params;

      if (!tutorId) {
        throw new AppError("Tutor ID is required", HTTP_statusCode.BadRequest);
      }

      const requestDTO = TutorMapper.mapGetVerificationDocumentsRequest(req);
      const result = await this._tutorService.getVerificationDocuments(requestDTO);

      sendSuccess(res, "Verification documents retrieved successfully", result.data);
    } catch (error) {
      next(error);
    }
  };

  getAllListedTutors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const listedTutors = await this._tutorService.getAllListedTutors();
      sendSuccess(res, "Successfully fetched all listed tutors", listedTutors);
    } catch (error) {
      next(error);
    }
  };

  getTutorCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const { page, limit, search } = req.params;
      

    } catch (error) {
      next(error);
    }
  };

  createSlots = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tutorId = this.getUserId(req);
      const { date, halfHourPrice, oneHourPrice, slots } = req.body;

      if (!date || !halfHourPrice || !oneHourPrice || !Array.isArray(slots)) {
        throw new AppError(
          "Date, prices, and slots array are required",
          HTTP_statusCode.BadRequest
        );
      }

      if (slots.length === 0) {
        throw new AppError("At least one slot is required", HTTP_statusCode.BadRequest);
      }

      const requestDTO = TutorMapper.mapCreateSlotsRequest(
        tutorId,
        date,
        halfHourPrice,
        oneHourPrice,
        slots
      );

      const result = await this._tutorService.createSlots(requestDTO);
      sendSuccess(res, result.message, result.data);
    } catch (error) {
      next(error);
    }
  };

  getTutorSlots = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tutorId = this.getUserId(req);
      const result = await this._tutorService.getTutorSlots(tutorId);
      sendSuccess(res, "Slots fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  // Private helper methods
  private parseCropData(cropDataString?: string): CropData | undefined {
    if (!cropDataString) return undefined;

    try {
      const cropData = JSON.parse(cropDataString);

      if (cropData && typeof cropData === "object") {
        const { x, y, width, height } = cropData;
        
        if (
          typeof x !== "number" ||
          typeof y !== "number" ||
          typeof width !== "number" ||
          typeof height !== "number"
        ) {
          throw new AppError("Invalid crop data structure", HTTP_statusCode.BadRequest);
        }

        if (x < 0 || y < 0 || width <= 0 || height <= 0) {
          throw new AppError("Invalid crop data values", HTTP_statusCode.BadRequest);
        }

        return cropData;
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Invalid crop data format", HTTP_statusCode.BadRequest);
    }
  }

  private validateAvatarFile(avatarFile?: Express.Multer.File, cropData?: CropData): void {
    if (!avatarFile) return;

    const maxSize = 5 * 1024 * 1024;
    if (avatarFile.size > maxSize) {
      throw new AppError("File size exceeds 5MB limit", HTTP_statusCode.BadRequest);
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(avatarFile.mimetype)) {
      throw new AppError(
        "Only JPEG, PNG, GIF, and WebP images are allowed",
        HTTP_statusCode.BadRequest
      );
    }

    if (cropData && avatarFile.buffer) {
      const { width, height } = cropData;
      if (width > 5000 || height > 5000) {
        throw new AppError("Crop area is too large", HTTP_statusCode.BadRequest);
      }
    }
  }

  private buildUpdateData(
    body: any,
    avatarFile?: Express.Multer.File,
    cropData?: CropData
  ): UpdateProfileData {
    const updateData: UpdateProfileData = {};

    if (body.name?.trim()) updateData.name = body.name.trim();
    if (body.phone?.trim()) updateData.phone = body.phone.trim();
    if (body.DOB) updateData.DOB = body.DOB;
    if (body.gender) updateData.gender = body.gender;
    if (body.designation?.trim()) updateData.designation = body.designation.trim();
    if (body.about?.trim()) updateData.about = body.about.trim();
    if (avatarFile) updateData.avatar = avatarFile;
    if (cropData) updateData.cropData = cropData;

    return updateData;
  }
}