import { Request, Response } from "express";
import { ResponseModel } from "../../models/ResponseModel";
import { ITutorService } from "../../interfaces/tutor/tutorServiceInterface";
import { TutorMapper } from "../../mappers/tutor/TutorMapper";

export class TutorController {
  private tutorService: ITutorService;

  constructor(tutorService: ITutorService) {
    this.tutorService = tutorService;
  }

  async submitVerificationDocuments(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("inside submitverificationdocs tutor");
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { email, phone } = req.body;
      console.log(files, email, phone);

      if (!files?.avatar || !files?.degree || !files?.aadharFront || !files?.aadharBack) {
        res
          .status(400)
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
          .status(400)
          .json(new ResponseModel(false, "Email or phone number is required"));
        return;
      }

      // Map request to DTO
      const requestDTO = TutorMapper.mapSubmitVerificationDocumentsRequest(req);

      // Call service with DTO
      const result = await this.tutorService.submitVerificationDocuments(requestDTO);

      if (result.success) {
        res
          .status(200)
          .json(
            new ResponseModel(
              true,
              "Verification documents submitted successfully",
              result.data
            )
          );
      } else {
        res.status(400).json(new ResponseModel(false, result.message));
      }
    } catch (error: any) {
      console.error("Error submitting verification documents:", error);
      res
        .status(500)
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
          .status(400)
          .json(new ResponseModel(false, "Email or phone number is required"));
        return;
      }

      // Map request to DTO
      const requestDTO = TutorMapper.mapGetVerificationStatusRequest(req);

      // Call service with DTO
      const result = await this.tutorService.getVerificationStatus(requestDTO);

      if (result.success) {
        res
          .status(200)
          .json(
            new ResponseModel(
              true,
              "Verification status retrieved successfully",
              result.data
            )
          );
      } else {
        res.status(404).json(new ResponseModel(false, result.message));
      }
    } catch (error: any) {
      console.error("Error getting verification status:", error);
      res
        .status(500)
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
        res.status(400).json(new ResponseModel(false, "Tutor ID is required"));
        return;
      }

      // Map request to DTO
      const requestDTO = TutorMapper.mapGetVerificationDocumentsRequest(req);

      // Call service with DTO
      const result = await this.tutorService.getVerificationDocuments(requestDTO);

      if (result.success) {
        res
          .status(200)
          .json(
            new ResponseModel(
              true,
              "Verification documents retrieved successfully",
              result.data
            )
          );
      } else {
        res.status(404).json(new ResponseModel(false, result.message));
      }
    } catch (error: any) {
      console.error("Error getting verification documents:", error);
      res
        .status(500)
        .json(
          new ResponseModel(
            false,
            "Internal server error while getting verification documents"
          )
        );
    }
  }
}