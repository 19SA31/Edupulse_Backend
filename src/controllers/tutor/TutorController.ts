import { Request, Response } from "express";
import { ResponseModel } from "../../models/ResponseModel";
import { ITutorService } from "../../interfaces/tutor/tutorServiceInterface";
import { TutorMapper } from "../../mappers/tutor/TutorMapper";
import HTTP_statusCode from "../../enums/HttpStatusCode";
import { ValidationError } from "../../errors/ValidationError";
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

  getTutorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log("Getting tutor profile");

      const userId = req.user?.id;

      if (!userId) {
        console.log("No user ID found in token");
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(
            new ResponseModel(false, "Unauthorized: User not authenticated")
          );
        return;
      }
      const result = await this._tutorService.getTutorProfile(userId);
      console.log("getTutorProfile",result)
      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(
            true,
            "Tutor profile retrieved successfully",
            result.tutor
          )
        );
    } catch (error) {
      console.error("Get tutor profile controller error:", error);

      if (error instanceof Error) {
        const errorMessage = error.message;

        if (errorMessage.includes("Tutor not found")) {
          res
            .status(HTTP_statusCode.NotFound)
            .json(new ResponseModel(false, errorMessage));
          return;
        }
      }

      res
        .status(HTTP_statusCode.InternalServerError)
        .json(new ResponseModel(false, "Internal server error"));
    }
  };

  updateTutorProfile = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      console.log("Inside controller for update tutor profile");
      console.log("Request body:", req.body);
      console.log("Request file:", req.file ? "File present" : "No file");

      const userId = req.user?.id;

      if (!userId) {
        console.log("No user ID found - middleware issue");
        res
          .status(HTTP_statusCode.Unauthorized)
          .json(
            new ResponseModel(false, "Unauthorized: User not authenticated")
          );
        return;
      }

      console.log("Authenticated tutor ID:", userId);

      const avatarFile = req.file;

      let cropData: CropData | undefined;
      if (req.body.cropData) {
        try {
          cropData = JSON.parse(req.body.cropData);
          console.log("Crop data received:", cropData);

          if (cropData && typeof cropData === "object") {
            const { x, y, width, height } = cropData;
            if (
              typeof x !== "number" ||
              typeof y !== "number" ||
              typeof width !== "number" ||
              typeof height !== "number"
            ) {
              console.log("Invalid crop data structure");
              res
                .status(HTTP_statusCode.BadRequest)
                .json(new ResponseModel(false, "Invalid crop data structure"));
              return;
            }

            if (x < 0 || y < 0 || width <= 0 || height <= 0) {
              console.log("Invalid crop data values");
              res
                .status(HTTP_statusCode.BadRequest)
                .json(new ResponseModel(false, "Invalid crop data values"));
              return;
            }
          }
        } catch (error) {
          console.log("Invalid crop data format");
          res
            .status(HTTP_statusCode.BadRequest)
            .json(new ResponseModel(false, "Invalid crop data format"));
          return;
        }
      }

      if (avatarFile) {
        const maxSize = 5 * 1024 * 1024;
        if (avatarFile.size > maxSize) {
          console.log("File size exceeds limit");
          res
            .status(HTTP_statusCode.BadRequest)
            .json(new ResponseModel(false, "File size exceeds 5MB limit"));
          return;
        }

        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(avatarFile.mimetype)) {
          console.log("Invalid file type");
          res
            .status(HTTP_statusCode.BadRequest)
            .json(
              new ResponseModel(
                false,
                "Only JPEG, PNG, GIF, and WebP images are allowed"
              )
            );
          return;
        }

        if (cropData && avatarFile.buffer) {
          const { x, y, width, height } = cropData;

          if (width > 5000 || height > 5000) {
            console.log("Crop area too large");
            res
              .status(HTTP_statusCode.BadRequest)
              .json(new ResponseModel(false, "Crop area is too large"));
            return;
          }
        }
      }

      const updateData: UpdateProfileData = {};

      if (req.body.name && req.body.name.trim()) {
        updateData.name = req.body.name.trim();
      }
      if (req.body.phone && req.body.phone.trim()) {
        updateData.phone = req.body.phone.trim();
      }
      if (req.body.DOB) {
        updateData.DOB = req.body.DOB;
      }
      if (req.body.gender) {
        updateData.gender = req.body.gender;
      }

      if (req.body.designation && req.body.designation.trim()) {
        updateData.designation = req.body.designation.trim();
      }

      if (req.body.about && req.body.about.trim()) {
        updateData.about = req.body.about.trim();
      }

      if (avatarFile) {
        updateData.avatar = avatarFile;
      }

      if (cropData) {
        updateData.cropData = cropData;
      }

      console.log("Update data:", updateData);
      console.log(
        "Avatar file:",
        avatarFile
          ? {
              originalname: avatarFile.originalname,
              mimetype: avatarFile.mimetype,
              size: avatarFile.size,
            }
          : "No avatar file"
      );

      if (Object.keys(updateData).length === 0) {
        console.log("No data provided for update");
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "No data provided for update"));
        return;
      }

      const result = await this._tutorService.updateProfile(userId, updateData);

      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(true, "Tutor profile updated successfully", result)
        );
    } catch (error) {
      console.error("Update tutor profile controller error:", error);

      if (error instanceof Error) {
        const errorMessage = error.message;

        if (
          errorMessage.includes("Name must be") ||
          errorMessage.includes("Phone number") ||
          errorMessage.includes("Date of birth") ||
          errorMessage.includes("Tutor must be") ||
          errorMessage.includes("Invalid gender") ||
          errorMessage.includes("already registered")
        ) {
          res
            .status(HTTP_statusCode.BadRequest)
            .json(new ResponseModel(false, errorMessage));
          return;
        }

        if (errorMessage.includes("Tutor not found")) {
          res
            .status(HTTP_statusCode.NotFound)
            .json(new ResponseModel(false, errorMessage));
          return;
        }

        if (errorMessage.includes("Failed to upload avatar")) {
          res
            .status(HTTP_statusCode.InternalServerError)
            .json(
              new ResponseModel(
                false,
                "Failed to upload avatar. Please try again."
              )
            );
          return;
        }

        if (errorMessage.includes("File too large")) {
          res
            .status(HTTP_statusCode.BadRequest)
            .json(
              new ResponseModel(false, "File size exceeds the allowed limit")
            );
          return;
        }
        if (errorMessage.includes("Only image files are allowed")) {
          res
            .status(HTTP_statusCode.BadRequest)
            .json(new ResponseModel(false, "Only image files are allowed"));
          return;
        }
        if (errorMessage.includes("Unexpected field")) {
          res
            .status(HTTP_statusCode.BadRequest)
            .json(new ResponseModel(false, "Invalid file field name"));
          return;
        }
      }

      res
        .status(HTTP_statusCode.InternalServerError)
        .json(new ResponseModel(false, "Internal server error"));
    }
  };

  async submitVerificationDocuments(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("inside submitverificationdocs tutor");

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { email, phone } = req.body;
      console.log(files, email, phone);

      if (
        !files?.avatar ||
        !files?.degree ||
        !files?.aadharFront ||
        !files?.aadharBack
      ) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(
            new ResponseModel(
              false,
              "All document files are required (avatar, degree, aadharFront, aadharBack)"
            )
          );
        return;
      }

      if (!email && !phone) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Email or phone number is required"));
        return;
      }

      const requestDTO = TutorMapper.mapSubmitVerificationDocumentsRequest(req);

      const result = await this._tutorService.submitVerificationDocuments(
        requestDTO
      );

      if (result.success) {
        res
          .status(HTTP_statusCode.OK)
          .json(
            new ResponseModel(
              true,
              "Verification documents submitted successfully",
              result.data
            )
          );
      } else {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, result.message));
      }
    } catch (error: any) {
      console.error("Error submitting verification documents:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json(
          new ResponseModel(
            false,
            "Internal server error while submitting documents"
          )
        );
    }
  }

  async getVerificationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { email, phone } = req.query;

      if (!email && !phone) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Email or phone number is required"));
        return;
      }

      const requestDTO = TutorMapper.mapGetVerificationStatusRequest(req);

      const result = await this._tutorService.getVerificationStatus(requestDTO);

      if (result.success) {
        res
          .status(HTTP_statusCode.OK)
          .json(
            new ResponseModel(
              true,
              "Verification status retrieved successfully",
              result.data
            )
          );
      } else {
        res
          .status(HTTP_statusCode.NotFound)
          .json(new ResponseModel(false, result.message));
      }
    } catch (error: any) {
      console.error("Error getting verification status:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json(
          new ResponseModel(
            false,
            "Internal server error while getting verification status"
          )
        );
    }
  }

  async getVerificationDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { tutorId } = req.params;

      if (!tutorId) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, "Tutor ID is required"));
        return;
      }

      const requestDTO = TutorMapper.mapGetVerificationDocumentsRequest(req);

      const result = await this._tutorService.getVerificationDocuments(
        requestDTO
      );

      if (result.success) {
        res
          .status(HTTP_statusCode.OK)
          .json(
            new ResponseModel(
              true,
              "Verification documents retrieved successfully",
              result.data
            )
          );
      } else {
        res
          .status(HTTP_statusCode.NotFound)
          .json(new ResponseModel(false, result.message));
      }
    } catch (error: any) {
      console.error("Error getting verification documents:", error);
      res
        .status(HTTP_statusCode.InternalServerError)
        .json(
          new ResponseModel(
            false,
            "Internal server error while getting verification documents"
          )
        );
    }
  }
  async getAllListedTutors(req: Request, res: Response): Promise<void> {
    try {
      const listedTutors = await this._tutorService.getAllListedTutors();
      console.log("getAllListedTutors",listedTutors)
      res
        .status(HTTP_statusCode.OK)
        .json(
          new ResponseModel(
            true,
            "Successfully fetched all listed tutors",
            listedTutors
          )
        );
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res
          .status(HTTP_statusCode.BadRequest)
          .json(new ResponseModel(false, error.message, null));
      } else {
        const response = new ResponseModel(
          false,
          "Error fetching listed courses",
          null
        );
        res.status(HTTP_statusCode.InternalServerError).json(response);
      }
    }
  }
}
