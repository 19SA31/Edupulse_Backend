import { ITutorRepository } from "../../interfaces/tutor/tutorRepoInterface";
import { ITutorService } from "../../interfaces/tutor/tutorServiceInterface";
import { 
  DocumentFiles, 
  ServiceResponse,
  VerificationSubmissionData,
  VerificationStatusData,
  VerificationDocumentsData,
  ITutorDocs 
} from "../../interfaces/tutorInterface/tutorInterface";
import { S3Service } from "../../utils/s3";

export class TutorService implements ITutorService {
  private tutorRepository: ITutorRepository;
  private s3Service: S3Service;

  constructor(tutorRepository: ITutorRepository, s3Service: S3Service) {
    this.tutorRepository = tutorRepository;
    this.s3Service = s3Service;
  }

  async submitVerificationDocuments(
    documentFiles: DocumentFiles,
    email?: string,
    phone?: string
  ): Promise<ServiceResponse<VerificationSubmissionData>> {
    try {
      const tutor = await this.tutorRepository.findTutorByEmailOrPhone(email, phone);

      if (!tutor) {
        return { success: false, message: "Tutor not found. Please register first." };
      }

      const existingDocs = await this.tutorRepository.findVerificationDocsByTutorId(
        tutor._id.toString()
      );

      if (existingDocs && existingDocs.verificationStatus === "approved") {
        return { success: false, message: "Verification documents already approved." };
      }

      const folderPath = `tutor-documents/${tutor._id}/`;

      const [degreeFileName, aadharFrontFileName, aadharBackFileName] = await Promise.all([
        this.s3Service.uploadFile(folderPath, documentFiles.degree),
        this.s3Service.uploadFile(folderPath, documentFiles.aadharFront),
        this.s3Service.uploadFile(folderPath, documentFiles.aadharBack),
      ]);

      const documentData: Partial<ITutorDocs> = {
        tutorId: tutor._id,
        degree: `${folderPath}${degreeFileName}`,
        aadharFront: `${folderPath}${aadharFrontFileName}`,
        aadharBack: `${folderPath}${aadharBackFileName}`,
        verificationStatus: "pending",
        submittedAt: new Date(),
      };

      let result;
      if (existingDocs) {
        if (existingDocs.verificationStatus !== "approved") {
          await this.deleteOldFiles(existingDocs);
          result = await this.tutorRepository.updateVerificationDocs(
            existingDocs._id.toString(),
            documentData
          );
        }
      } else {
        result = await this.tutorRepository.createVerificationDocs(documentData as ITutorDocs);
      }

      if (result) {
        return {
          success: true,
          message: "Verification documents submitted successfully",
          data: {
            verificationId: result._id.toString(),
            status: result.verificationStatus,
            submittedAt: result.submittedAt,
          },
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
    email?: string,
    phone?: string
  ): Promise<ServiceResponse<VerificationStatusData>> {
    try {
      const tutor = await this.tutorRepository.findTutorByEmailOrPhone(email, phone);

      if (!tutor) {
        return { success: false, message: "Tutor not found" };
      }

      const verificationDocs = await this.tutorRepository.findVerificationDocsByTutorId(
        tutor._id.toString()
      );

      if (!verificationDocs) {
        return {
          success: true,
          message: "No verification documents found",
          data: {
            status: "not_submitted",
            tutorId: tutor._id.toString(),
          },
        };
      }

      return {
        success: true,
        message: "Verification status retrieved successfully",
        data: {
          status: verificationDocs.verificationStatus,
          tutorId: tutor._id.toString(),
          submittedAt: verificationDocs.submittedAt,
          reviewedAt: verificationDocs.reviewedAt,
          rejectionReason: verificationDocs.rejectionReason,
        },
      };
    } catch (error: any) {
      console.error("Error in getVerificationStatus:", error);
      return { success: false, message: "Error retrieving verification status" };
    }
  }

  async getVerificationDocuments(
    tutorId: string
  ): Promise<ServiceResponse<VerificationDocumentsData>> {
    try {
      const verificationDocs = await this.tutorRepository.findVerificationDocsByTutorId(tutorId);

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

      return {
        success: true,
        message: "Verification documents retrieved successfully",
        data: {
          verificationId: verificationDocs._id.toString(),
          tutorId: verificationDocs.tutorId.toString(),
          documents: {
            degree: degreeUrl,
            aadharFront: aadharFrontUrl,
            aadharBack: aadharBackUrl,
          },
          verificationStatus: verificationDocs.verificationStatus,
          submittedAt: verificationDocs.submittedAt,
          reviewedAt: verificationDocs.reviewedAt,
          rejectionReason: verificationDocs.rejectionReason,
        },
      };
    } catch (error: any) {
      console.error("Error in getVerificationDocuments:", error);
      return { success: false, message: "Error retrieving verification documents" };
    }
  }

  private async deleteOldFiles(existingDocs: ITutorDocs): Promise<void> {
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