import { ITutorRepository } from "../../interfaces/tutor/tutorRepoInterface";
import { ITutorService } from "../../interfaces/tutor/tutorServiceInterface";
import { ServiceResponse } from "../../interfaces/tutorInterface/tutorInterface";
import { S3Service } from "../../utils/s3";
import { TutorMapper } from "../../mappers/tutor/TutorMapper";
import {
  SubmitVerificationDocumentsRequestDTO,
  SubmitVerificationDocumentsResponseDTO,
  GetVerificationStatusRequestDTO,
  GetVerificationStatusResponseDTO,
  GetVerificationDocumentsRequestDTO,
  GetVerificationDocumentsResponseDTO,
  VerificationDocsServiceDTO
} from "../../dto/tutor/TutorDTO";

export class TutorService implements ITutorService {
  private tutorRepository: ITutorRepository;
  private s3Service: S3Service;

  constructor(tutorRepository: ITutorRepository, s3Service: S3Service) {
    this.tutorRepository = tutorRepository;
    this.s3Service = s3Service;
  }

  async submitVerificationDocuments(
    requestDTO: SubmitVerificationDocumentsRequestDTO
  ): Promise<ServiceResponse<SubmitVerificationDocumentsResponseDTO>> {
    try {
      const tutor = await this.tutorRepository.findTutorByEmailOrPhone(
        requestDTO.email,
        requestDTO.phone
      );

      if (!tutor) {
        return { success: false, message: "Tutor not found. Please register first." };
      }

      const existingDocs = await this.tutorRepository.findVerificationDocsByTutorId(tutor._id);

      if (existingDocs && existingDocs.verificationStatus === "approved") {
        return { success: false, message: "Verification documents already approved." };
      }

      const folderPath = `tutor-documents/${tutor._id}/`;
      const documentFiles = TutorMapper.mapDocumentFilesToDocumentFiles(requestDTO);

      const [degreeFileName, aadharFrontFileName, aadharBackFileName] = await Promise.all([
        this.s3Service.uploadFile(folderPath, documentFiles.degree),
        this.s3Service.uploadFile(folderPath, documentFiles.aadharFront),
        this.s3Service.uploadFile(folderPath, documentFiles.aadharBack),
      ]);

      const degreeUrl = `${folderPath}${degreeFileName}`;
      const aadharFrontUrl = `${folderPath}${aadharFrontFileName}`;
      const aadharBackUrl = `${folderPath}${aadharBackFileName}`;

      let result: VerificationDocsServiceDTO | null = null;

      if (existingDocs) {
        if (existingDocs.verificationStatus !== "approved") {
          await this.deleteOldFiles(existingDocs);
          const updateDTO = TutorMapper.mapToUpdateVerificationDocsDTO(
            degreeUrl,
            aadharFrontUrl,
            aadharBackUrl,
            'pending'
          );
          result = await this.tutorRepository.updateVerificationDocs(existingDocs._id, updateDTO);
        }
      } else {
        const createDTO = TutorMapper.mapToCreateVerificationDocsDTO(
          tutor._id,
          degreeUrl,
          aadharFrontUrl,
          aadharBackUrl
        );
        result = await this.tutorRepository.createVerificationDocs(createDTO);
      }

      if (result) {
        const responseData = TutorMapper.mapToSubmitVerificationDocumentsResponse({
          verificationId: result._id,
          status: result.verificationStatus,
          submittedAt: result.submittedAt,
        });

        return {
          success: true,
          message: "Verification documents submitted successfully",
          data: responseData,
        };
      } else {
        return { success: false, message: "Failed to save verification documents" };
      }
    } catch (error: any) {
      console.error("Error in submitVerificationDocuments:", error);
      return { success: false, message: "Error submitting verification documents" };
    }
  }

  async getVerificationStatus(
    requestDTO: GetVerificationStatusRequestDTO
  ): Promise<ServiceResponse<GetVerificationStatusResponseDTO>> {
    try {
      const tutor = await this.tutorRepository.findTutorByEmailOrPhone(
        requestDTO.email,
        requestDTO.phone
      );

      if (!tutor) {
        return { success: false, message: "Tutor not found" };
      }

      const verificationDocs = await this.tutorRepository.findVerificationDocsByTutorId(tutor._id);

      if (!verificationDocs) {
        const responseData = TutorMapper.mapToGetVerificationStatusResponse({
          status: "not_submitted",
          tutorId: tutor._id,
        });

        return {
          success: true,
          message: "No verification documents found",
          data: responseData,
        };
      }

      const responseData = TutorMapper.mapToGetVerificationStatusResponse({
        status: verificationDocs.verificationStatus,
        tutorId: tutor._id,
        submittedAt: verificationDocs.submittedAt,
        reviewedAt: verificationDocs.reviewedAt,
        rejectionReason: verificationDocs.rejectionReason,
      });

      return {
        success: true,
        message: "Verification status retrieved successfully",
        data: responseData,
      };
    } catch (error: any) {
      console.error("Error in getVerificationStatus:", error);
      return { success: false, message: "Error retrieving verification status" };
    }
  }

  async getVerificationDocuments(
    requestDTO: GetVerificationDocumentsRequestDTO
  ): Promise<ServiceResponse<GetVerificationDocumentsResponseDTO>> {
    try {
      const verificationDocs = await this.tutorRepository.findVerificationDocsByTutorId(
        requestDTO.tutorId
      );

      if (!verificationDocs) {
        return { success: false, message: "No verification documents found" };
      }

      const [degreeUrl, aadharFrontUrl, aadharBackUrl] = await Promise.all([
        this.s3Service.getFile(
          this.getFileNameFromPath(verificationDocs.degree),
          this.getFolderFromPath(verificationDocs.degree)
        ),
        this.s3Service.getFile(
          this.getFileNameFromPath(verificationDocs.aadharFront),
          this.getFolderFromPath(verificationDocs.aadharFront)
        ),
        this.s3Service.getFile(
          this.getFileNameFromPath(verificationDocs.aadharBack),
          this.getFolderFromPath(verificationDocs.aadharBack)
        ),
      ]);

      const responseData = TutorMapper.mapToGetVerificationDocumentsResponse({
        verificationId: verificationDocs._id,
        tutorId: verificationDocs.tutorId,
        documents: {
          degree: degreeUrl,
          aadharFront: aadharFrontUrl,
          aadharBack: aadharBackUrl,
        },
        verificationStatus: verificationDocs.verificationStatus,
        submittedAt: verificationDocs.submittedAt,
        reviewedAt: verificationDocs.reviewedAt,
        rejectionReason: verificationDocs.rejectionReason,
      });

      return {
        success: true,
        message: "Verification documents retrieved successfully",
        data: responseData,
      };
    } catch (error: any) {
      console.error("Error in getVerificationDocuments:", error);
      return { success: false, message: "Error retrieving verification documents" };
    }
  }

  private async deleteOldFiles(existingDocs: VerificationDocsServiceDTO): Promise<void> {
    try {
      await Promise.all([
        this.s3Service.deleteFile(existingDocs.degree),
        this.s3Service.deleteFile(existingDocs.aadharFront),
        this.s3Service.deleteFile(existingDocs.aadharBack),
      ]);
    } catch (error) {
      console.error("Error deleting old files:", error);
    }
  }

  private getFileNameFromPath(filePath: string): string {
    return filePath.split("/").pop() || "";
  }

  private getFolderFromPath(filePath: string): string {
    const parts = filePath.split("/");
    return parts.slice(0, -1).join("/");
  }
}