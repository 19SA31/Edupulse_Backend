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
} from "../../dto/tutor/TutorDTO";
import { UpdateProfileData, TutorProfileData } from "../../interfaces/tutorInterface/tutorInterface";
import { cropAndSave } from '../../helper/Sharp';

export class TutorService implements ITutorService {
  private tutorRepository: ITutorRepository;
  private s3Service: S3Service;

  constructor(tutorRepository: ITutorRepository, s3Service: S3Service) {
    this.tutorRepository = tutorRepository;
    this.s3Service = s3Service;
  }

  async updateProfile(
    tutorId: string, 
    updateData: UpdateProfileData
  ): Promise<{ tutor: TutorProfileData }> {
    console.log("inside service for update tutor profile", tutorId);
    console.log("updateData received:", updateData);

    
    const existingTutor = await this.tutorRepository.findById(tutorId);
    if (!existingTutor) {
      throw new Error('Tutor not found');
    }

    
    if (updateData.name !== undefined) {
      if (!updateData.name || updateData.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      if (updateData.name.trim().length > 50) {
        throw new Error('Name must be less than 50 characters');
      }
      updateData.name = updateData.name.trim();
    }

    
    if (updateData.phone !== undefined) {
      if (!updateData.phone) {
        throw new Error('Phone number is required');
      }
      
      const phoneRegex = /^[0-9]{10,15}$/;
      const cleanPhone = updateData.phone.replace(/\D/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error('Please enter a valid phone number (10-15 digits)');
      }

      
      const existingPhoneTutor = await this.tutorRepository.findByPhoneExcludingId(cleanPhone, tutorId);
      if (existingPhoneTutor) {
        throw new Error('Phone number is already registered with another account');
      }
      
      updateData.phone = cleanPhone;
    }

    
    if (updateData.DOB !== undefined && updateData.DOB) {
      const dobDate = new Date(updateData.DOB);
      const today = new Date();
      
      if (dobDate > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      
      
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 18);
      
      if (dobDate > minAge) {
        throw new Error('Tutor must be at least 18 years old');
      }
    }

  
    if (updateData.gender !== undefined && updateData.gender) {
      if (!['male', 'female', 'other'].includes(updateData.gender)) {
        throw new Error('Invalid gender selection');
      }
    }

    
    if (updateData.avatar && updateData.avatar !== null && typeof updateData.avatar === 'object' && 'buffer' in updateData.avatar) {
      try {
        console.log("Processing tutor avatar upload");
        
        const avatarFile = updateData.avatar as Express.Multer.File;
        let processedBuffer = avatarFile.buffer;

        
        if (updateData.cropData) {
          const { x, y, width, height } = updateData.cropData;
          console.log("Applying crop data:", updateData.cropData);
          
          processedBuffer = await cropAndSave(x, y, width, height, avatarFile.buffer) as Buffer;
        }

        
        const processedFile = {
          ...avatarFile,
          buffer: processedBuffer
        };

        
        if (existingTutor.avatar) {
          try {
            await this.s3Service.deleteFile(existingTutor.avatar);
            console.log("Old tutor avatar deleted from S3");
          } catch (deleteError) {
            console.warn('Failed to delete old avatar:', deleteError);
            
          }
        }

        
        const avatarS3Key = await this.s3Service.uploadFile('tutor_avatars', processedFile);
        
        updateData.avatar = avatarS3Key;
        console.log("New tutor avatar uploaded:", avatarS3Key);

      } catch (uploadError) {
        console.error('Tutor avatar upload error:', uploadError);
        throw new Error('Failed to upload avatar. Please try again.');
      }
    } else if (updateData.avatar === null) {
      
      console.log("Deleting tutor avatar");
      
      
      if (existingTutor.avatar) {
        try {
          await this.s3Service.deleteFile(existingTutor.avatar);
          console.log("Tutor avatar deleted from S3");
        } catch (deleteError) {
          console.warn('Failed to delete avatar:', deleteError);
        }
      }
    }

    
    const { cropData, ...dataToUpdate } = updateData;

    
    const updatedTutor = await this.tutorRepository.updateProfile(tutorId, dataToUpdate);
    
    if (!updatedTutor) {
      throw new Error('Failed to update profile');
    }

    
    let avatarUrl = null;
    if (updatedTutor.avatar) {
      try {
        avatarUrl = await this.s3Service.getFile(updatedTutor.avatar);
      } catch (error) {
        console.warn('Failed to generate avatar URL:', error);
      }
    }

    
    const responseData: TutorProfileData = {
      _id: updatedTutor._id.toString(),
      name: updatedTutor.name,
      email: updatedTutor.email,
      phone: updatedTutor.phone,
      DOB: updatedTutor.DOB,
      gender: updatedTutor.gender,
      avatar: avatarUrl, 
      isBlocked: updatedTutor.isBlocked,
      createdAt: updatedTutor.createdAt,
      updatedAt: updatedTutor.updatedAt,
      lastLogin: updatedTutor.lastLogin
    };

    return { tutor: responseData };
  }

  async getTutorProfile(tutorId: string): Promise<{ tutor: TutorProfileData }> {
    const tutor = await this.tutorRepository.findById(tutorId);
    
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    
    let avatarUrl = null;
    if (tutor.avatar) {
      try {
        avatarUrl = await this.s3Service.getFile(tutor.avatar);
      } catch (error) {
        console.warn('Failed to generate avatar URL:', error);
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
      lastLogin: tutor.lastLogin
    };

    return { tutor: responseData };
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
        return {
          success: false,
          message: "Tutor not found. Please register first.",
        };
      }

      const existingDocs =
        await this.tutorRepository.findVerificationDocsByTutorId(tutor._id);

      if (existingDocs && existingDocs.verificationStatus === "approved") {
        return {
          success: false,
          message: "Verification documents already approved.",
        };
      }

      const folderPath = `tutor-documents/${tutor._id}`;
      const documentFiles =
        TutorMapper.mapDocumentFilesToDocumentFiles(requestDTO);

      
      const [
        avatarS3Key,
        degreeS3Key,
        aadharFrontS3Key,
        aadharBackS3Key,
      ] = await Promise.all([
        this.s3Service.uploadFile(folderPath, documentFiles.avatar),
        this.s3Service.uploadFile(folderPath, documentFiles.degree),
        this.s3Service.uploadFile(folderPath, documentFiles.aadharFront),
        this.s3Service.uploadFile(folderPath, documentFiles.aadharBack),
      ]);

      let result: VerificationDocsServiceDTO | null = null;

      if (existingDocs) {
        if (existingDocs.verificationStatus !== "approved") {
          await this.deleteOldFiles(existingDocs);
          const updateDTO = TutorMapper.mapToUpdateVerificationDocsDTO(
            avatarS3Key,
            degreeS3Key,
            aadharFrontS3Key,
            aadharBackS3Key,
            "pending"
          );
          result = await this.tutorRepository.updateVerificationDocs(
            existingDocs._id,
            updateDTO
          );
        }
      } else {
        const createDTO = TutorMapper.mapToCreateVerificationDocsDTO(
          tutor._id,
          avatarS3Key,
          degreeS3Key,
          aadharFrontS3Key,
          aadharBackS3Key
        );
        result = await this.tutorRepository.createVerificationDocs(createDTO);
      }

      if (result) {
        const responseData =
          TutorMapper.mapToSubmitVerificationDocumentsResponse({
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
        return {
          success: false,
          message: "Failed to save verification documents",
        };
      }
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
      const tutor = await this.tutorRepository.findTutorByEmailOrPhone(
        requestDTO.email,
        requestDTO.phone
      );

      if (!tutor) {
        return { success: false, message: "Tutor not found" };
      }

      const verificationDocs =
        await this.tutorRepository.findVerificationDocsByTutorId(tutor._id);

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
        await this.tutorRepository.findVerificationDocsByTutorId(
          requestDTO.tutorId
        );

      if (!verificationDocs) {
        return { success: false, message: "No verification documents found" };
      }

      
      const [avatarUrl, degreeUrl, aadharFrontUrl, aadharBackUrl] = await Promise.all([
        this.s3Service.getFile(verificationDocs.avatar),
        this.s3Service.getFile(verificationDocs.degree),
        this.s3Service.getFile(verificationDocs.aadharFront),
        this.s3Service.getFile(verificationDocs.aadharBack),
      ]);

      const responseData = TutorMapper.mapToGetVerificationDocumentsResponse({
        verificationId: verificationDocs._id,
        tutorId: verificationDocs.tutorId,
        documents: {
          avatar: avatarUrl,
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
      return {
        success: false,
        message: "Error retrieving verification documents",
      };
    }
  }

  private async deleteOldFiles(
    existingDocs: VerificationDocsServiceDTO
  ): Promise<void> {
    try {
      
      await Promise.all([
        this.s3Service.deleteFile(existingDocs.avatar),
        this.s3Service.deleteFile(existingDocs.degree),
        this.s3Service.deleteFile(existingDocs.aadharFront),
        this.s3Service.deleteFile(existingDocs.aadharBack),
      ]);
    } catch (error) {
      console.error("Error deleting old files:", error);
    }
  }
}