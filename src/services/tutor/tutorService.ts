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
  VerificationDocsServiceDTO,
  ListedTutorDTO,
} from "../../dto/tutor/TutorDTO";
import {
  UpdateProfileData,
  TutorProfileData,
} from "../../interfaces/tutorInterface/tutorInterface";
import { cropAndSave } from "../../helper/Sharp";

export class TutorService implements ITutorService {
  private _tutorRepository: ITutorRepository;
  private _s3Service: S3Service;

  constructor(tutorRepository: ITutorRepository, s3Service: S3Service) {
    this._tutorRepository = tutorRepository;
    this._s3Service = s3Service;
  }

  async updateProfile(
    tutorId: string,
    updateData: UpdateProfileData
  ): Promise<{ tutor: TutorProfileData }> {
    console.log("Updating tutor profile:", tutorId);

    const existingTutor = await this._tutorRepository.findById(tutorId);
    if (!existingTutor) {
      throw new Error("Tutor not found");
    }

    await this.validateUpdateData(tutorId, updateData);

    const processedUpdateData = await this.processAvatarUpdate(
      existingTutor,
      updateData
    );

    const updatedTutor = await this._tutorRepository.updateProfile(
      tutorId,
      processedUpdateData
    );

    if (!updatedTutor) {
      throw new Error("Failed to update profile");
    }
    return await this.buildTutorProfileResponse(updatedTutor);
  }

  async getTutorProfile(tutorId: string): Promise<{ tutor: TutorProfileData }> {
    const tutor = await this._tutorRepository.findById(tutorId);

    if (!tutor) {
      throw new Error("Tutor not found");
    }

    return await this.buildTutorProfileResponse(tutor);
  }

  async submitVerificationDocuments(
    requestDTO: SubmitVerificationDocumentsRequestDTO
  ): Promise<ServiceResponse<SubmitVerificationDocumentsResponseDTO>> {
    try {
      const tutorDTO = await this._tutorRepository.findTutorByEmailOrPhone(
        requestDTO.email,
        requestDTO.phone
      );

      if (!tutorDTO) {
        return {
          success: false,
          message: "Tutor not found. Please register first.",
        };
      }

      const existingDocs =
        await this._tutorRepository.findVerificationDocsByTutorId(tutorDTO._id);

      if (existingDocs && existingDocs.verificationStatus === "approved") {
        return {
          success: false,
          message: "Verification documents already approved.",
        };
      }

      const uploadedDocuments = await this.uploadVerificationDocuments(
        tutorDTO._id,
        requestDTO
      );

      const result = await this.saveOrUpdateVerificationDocuments(
        existingDocs,
        tutorDTO._id,
        uploadedDocuments
      );

      if (!result) {
        return {
          success: false,
          message: "Failed to save verification documents",
        };
      }

      const responseData = TutorMapper.mapToSubmitVerificationDocumentsResponse(
        {
          verificationId: result._id,
          status: result.verificationStatus,
          submittedAt: result.submittedAt,
        }
      );

      return {
        success: true,
        message: "Verification documents submitted successfully",
        data: responseData,
      };
    } catch (error: any) {
      console.error("Error in submitVerificationDocuments:", error);
      return {
        success: false,
        message: "Error submitting verification documents",
      };
    }
  }

  async getVerificationStatus(
    requestDTO: GetVerificationStatusRequestDTO
  ): Promise<ServiceResponse<GetVerificationStatusResponseDTO>> {
    try {
      const tutorDTO = await this._tutorRepository.findTutorByEmailOrPhone(
        requestDTO.email,
        requestDTO.phone
      );

      if (!tutorDTO) {
        return { success: false, message: "Tutor not found" };
      }

      const verificationDocs =
        await this._tutorRepository.findVerificationDocsByTutorId(tutorDTO._id);

      const responseData = TutorMapper.mapToGetVerificationStatusResponse({
        status: verificationDocs?.verificationStatus || "not_submitted",
        tutorId: tutorDTO._id,
        submittedAt: verificationDocs?.submittedAt,
        reviewedAt: verificationDocs?.reviewedAt,
        rejectionReason: verificationDocs?.rejectionReason,
      });

      return {
        success: true,
        message: verificationDocs
          ? "Verification status retrieved successfully"
          : "No verification documents found",
        data: responseData,
      };
    } catch (error: any) {
      console.error("Error in getVerificationStatus:", error);
      return {
        success: false,
        message: "Error retrieving verification status",
      };
    }
  }

  async getVerificationDocuments(
    requestDTO: GetVerificationDocumentsRequestDTO
  ): Promise<ServiceResponse<GetVerificationDocumentsResponseDTO>> {
    try {
      const verificationDocs =
        await this._tutorRepository.findVerificationDocsByTutorId(
          requestDTO.tutorId
        );

      if (!verificationDocs) {
        return { success: false, message: "No verification documents found" };
      }

      const documentUrls = await this.generateDocumentUrls(verificationDocs);

      const responseData = TutorMapper.mapToGetVerificationDocumentsResponse({
        verificationId: verificationDocs._id,
        tutorId: verificationDocs.tutorId,
        documents: documentUrls,
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
      return {
        success: false,
        message: "Error retrieving verification documents",
      };
    }
  }

  private async validateUpdateData(
    tutorId: string,
    updateData: UpdateProfileData
  ): Promise<void> {
    if (updateData.name !== undefined) {
      const trimmedName = updateData.name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        throw new Error("Name must be between 2 and 50 characters");
      }
      updateData.name = trimmedName;
    }

    if (updateData.phone !== undefined) {
      if (!updateData.phone) {
        throw new Error("Phone number is required");
      }

      const cleanPhone = updateData.phone.replace(/\D/g, "");
      if (!/^[0-9]{10,15}$/.test(cleanPhone)) {
        throw new Error("Please enter a valid phone number (10-15 digits)");
      }

      const existingPhoneTutor =
        await this._tutorRepository.findByPhoneExcludingId(cleanPhone, tutorId);
      if (existingPhoneTutor) {
        throw new Error(
          "Phone number is already registered with another account"
        );
      }

      updateData.phone = cleanPhone;
    }

    if (updateData.DOB !== undefined && updateData.DOB) {
      const dobDate = new Date(updateData.DOB);
      const today = new Date();

      if (dobDate > today) {
        throw new Error("Date of birth cannot be in the future");
      }

      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 18);

      if (dobDate > minAge) {
        throw new Error("Tutor must be at least 18 years old");
      }
    }

    if (updateData.gender !== undefined && updateData.gender) {
      if (!["male", "female", "other"].includes(updateData.gender)) {
        throw new Error("Invalid gender selection");
      }
    }
  }

  private async processAvatarUpdate(
    existingTutor: any,
    updateData: UpdateProfileData
  ): Promise<UpdateProfileData> {
    const processedData = { ...updateData };

    if (this.isAvatarFile(updateData.avatar)) {
      try {
        console.log("Processing tutor avatar upload");

        const avatarFile = updateData.avatar as Express.Multer.File;
        let processedBuffer = avatarFile.buffer;

        if (updateData.cropData) {
          const { x, y, width, height } = updateData.cropData;
          processedBuffer = (await cropAndSave(
            x,
            y,
            width,
            height,
            avatarFile.buffer
          )) as Buffer;
        }

        const processedFile = { ...avatarFile, buffer: processedBuffer };

        if (existingTutor.avatar) {
          await this.safeDeleteFile(existingTutor.avatar);
        }

        const avatarS3Key = await this._s3Service.uploadFile(
          "tutor_avatars",
          processedFile
        );
        processedData.avatar = avatarS3Key;

        console.log("New tutor avatar uploaded:", avatarS3Key);
      } catch (uploadError) {
        console.error("Tutor avatar upload error:", uploadError);
        throw new Error("Failed to upload avatar. Please try again.");
      }
    } else if (updateData.avatar === null && existingTutor.avatar) {
      console.log("Deleting tutor avatar");
      await this.safeDeleteFile(existingTutor.avatar);
    }

    delete processedData.cropData;
    return processedData;
  }

  private isAvatarFile(avatar: any): boolean {
    return (
      avatar &&
      typeof avatar === "object" &&
      "buffer" in avatar &&
      avatar.buffer instanceof Buffer
    );
  }

  private async safeDeleteFile(fileKey: string): Promise<void> {
    try {
      await this._s3Service.deleteFile(fileKey);
      console.log("File deleted from S3:", fileKey);
    } catch (deleteError) {
      console.warn("Failed to delete file:", deleteError);
    }
  }

  private async buildTutorProfileResponse(
    tutor: any
  ): Promise<{ tutor: TutorProfileData }> {
    let avatarUrl = null;
    if (tutor.avatar) {
      try {
        avatarUrl = await this._s3Service.getFile(tutor.avatar);
      } catch (error) {
        console.warn("Failed to generate avatar URL:", error);
      }
    }

    const responseData: TutorProfileData = {
      _id: tutor._id.toString(),
      name: tutor.name,
      email: tutor.email,
      phone: tutor.phone,
      DOB: tutor.DOB,
      gender: tutor.gender,
      avatar: avatarUrl,
      isBlocked: tutor.isBlocked,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt,
      lastLogin: tutor.lastLogin,
    };

    return { tutor: responseData };
  }

  private async uploadVerificationDocuments(
    tutorId: string,
    requestDTO: SubmitVerificationDocumentsRequestDTO
  ): Promise<{
    avatarS3Key: string;
    degreeS3Key: string;
    aadharFrontS3Key: string;
    aadharBackS3Key: string;
  }> {
    const folderPath = `tutor-documents/${tutorId}`;
    const documentFiles =
      TutorMapper.mapDocumentFilesToDocumentFiles(requestDTO);

    const [avatarS3Key, degreeS3Key, aadharFrontS3Key, aadharBackS3Key] =
      await Promise.all([
        this._s3Service.uploadFile(folderPath, documentFiles.avatar),
        this._s3Service.uploadFile(folderPath, documentFiles.degree),
        this._s3Service.uploadFile(folderPath, documentFiles.aadharFront),
        this._s3Service.uploadFile(folderPath, documentFiles.aadharBack),
      ]);

    return { avatarS3Key, degreeS3Key, aadharFrontS3Key, aadharBackS3Key };
  }

  private async saveOrUpdateVerificationDocuments(
    existingDocs: VerificationDocsServiceDTO | null,
    tutorId: string,
    uploadedDocuments: {
      avatarS3Key: string;
      degreeS3Key: string;
      aadharFrontS3Key: string;
      aadharBackS3Key: string;
    }
  ): Promise<VerificationDocsServiceDTO | null> {
    const { avatarS3Key, degreeS3Key, aadharFrontS3Key, aadharBackS3Key } =
      uploadedDocuments;

    if (existingDocs && existingDocs.verificationStatus !== "approved") {
      await this.deleteOldFiles(existingDocs);

      const updateDTO = TutorMapper.mapToUpdateVerificationDocsDTO(
        avatarS3Key,
        degreeS3Key,
        aadharFrontS3Key,
        aadharBackS3Key,
        "pending"
      );
      return await this._tutorRepository.updateVerificationDocs(
        existingDocs._id,
        updateDTO
      );
    } else if (!existingDocs) {
      const createDTO = TutorMapper.mapToCreateVerificationDocsDTO(
        tutorId,
        avatarS3Key,
        degreeS3Key,
        aadharFrontS3Key,
        aadharBackS3Key
      );
      return await this._tutorRepository.createVerificationDocs(createDTO);
    }

    return null;
  }

  private async generateDocumentUrls(
    verificationDocs: VerificationDocsServiceDTO
  ): Promise<{
    avatar: string;
    degree: string;
    aadharFront: string;
    aadharBack: string;
  }> {
    const [avatarUrl, degreeUrl, aadharFrontUrl, aadharBackUrl] =
      await Promise.all([
        this._s3Service.getFile(verificationDocs.avatar),
        this._s3Service.getFile(verificationDocs.degree),
        this._s3Service.getFile(verificationDocs.aadharFront),
        this._s3Service.getFile(verificationDocs.aadharBack),
      ]);

    return {
      avatar: avatarUrl,
      degree: degreeUrl,
      aadharFront: aadharFrontUrl,
      aadharBack: aadharBackUrl,
    };
  }

  private async deleteOldFiles(
    existingDocs: VerificationDocsServiceDTO
  ): Promise<void> {
    try {
      await Promise.all([
        this.safeDeleteFile(existingDocs.avatar),
        this.safeDeleteFile(existingDocs.degree),
        this.safeDeleteFile(existingDocs.aadharFront),
        this.safeDeleteFile(existingDocs.aadharBack),
      ]);
    } catch (error) {
      console.error("Error deleting old files:", error);
    }
  }

  async getAllListedTutors(): Promise<ListedTutorDTO[]> {
    try {
      const tutors = await this._tutorRepository.findAllListedTutors();
      await Promise.all(
        tutors.map(async (tutor) => {
          try {
            if (tutor.avatar) {
              tutor.avatar = await this._s3Service.getFile(tutor.avatar);
            }
          } catch (error) {
            console.error(
              `Error getting signed URL for course ${tutor._id}:`,
              error
            );
            tutor.avatar = tutor.avatar;
          }
        })
      );
      return TutorMapper.toListedTutorDTOArray(tutors);
    } catch (error) {
      throw new Error(`Failed to fetch listed tutors: ${error}`);
    }
  }
}
