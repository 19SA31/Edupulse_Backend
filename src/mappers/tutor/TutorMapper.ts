// /src/mappers/tutor/TutorMapper.ts

import { Request } from "express";
import {
  Tutor,
  TutorDocs,
  DocumentFiles,
} from "../../interfaces/tutorInterface/tutorInterface";
import {
  SubmitVerificationDocumentsRequestDTO,
  SubmitVerificationDocumentsResponseDTO,
  GetVerificationStatusRequestDTO,
  GetVerificationStatusResponseDTO,
  GetVerificationDocumentsRequestDTO,
  GetVerificationDocumentsResponseDTO,
  TutorServiceDTO,
  VerificationDocsServiceDTO,
  CreateVerificationDocsDTO,
  UpdateVerificationDocsDTO,
  ListedTutorDTO,
} from "../../dto/tutor/TutorDTO";

export class TutorMapper {
  static mapSubmitVerificationDocumentsRequest(
    req: Request
  ): SubmitVerificationDocumentsRequestDTO {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { email, phone } = req.body;

    return {
      email,
      phone,
      files: {
        avatar: files.avatar[0],
        degree: files.degree[0],
        aadharFront: files.aadharFront[0],
        aadharBack: files.aadharBack[0],
      },
    };
  }

  static mapGetVerificationStatusRequest(
    req: Request
  ): GetVerificationStatusRequestDTO {
    const { email, phone } = req.query;
    return {
      email: email as string,
      phone: phone as string,
    };
  }

  static mapGetVerificationDocumentsRequest(
    req: Request
  ): GetVerificationDocumentsRequestDTO {
    const { tutorId } = req.params;
    return {
      tutorId,
    };
  }

  static mapDocumentFilesToDocumentFiles(
    dto: SubmitVerificationDocumentsRequestDTO
  ): DocumentFiles {
    return {
      avatar: dto.files.avatar,
      degree: dto.files.degree,
      aadharFront: dto.files.aadharFront,
      aadharBack: dto.files.aadharBack,
    };
  }

  static mapToSubmitVerificationDocumentsResponse(
    data: any
  ): SubmitVerificationDocumentsResponseDTO {
    return {
      verificationId: data.verificationId,
      status: data.status,
      submittedAt: data.submittedAt,
    };
  }

  static mapToGetVerificationStatusResponse(
    data: any
  ): GetVerificationStatusResponseDTO {
    return {
      status: data.status,
      tutorId: data.tutorId,
      submittedAt: data.submittedAt,
      reviewedAt: data.reviewedAt,
      rejectionReason: data.rejectionReason,
    };
  }

  static mapToGetVerificationDocumentsResponse(
    data: any
  ): GetVerificationDocumentsResponseDTO {
    return {
      verificationId: data.verificationId,
      tutorId: data.tutorId,
      documents: data.documents,
      verificationStatus: data.verificationStatus,
      submittedAt: data.submittedAt,
      reviewedAt: data.reviewedAt,
      rejectionReason: data.rejectionReason,
    };
  }

  static mapTutorToServiceDTO(tutor: Tutor): TutorServiceDTO {
    return {
      _id: tutor._id.toString(),
      email: tutor.email,
      phone: tutor.phone,
      name: tutor.name,
      isVerified: tutor.isVerified,
    };
  }

  static mapVerificationDocsToServiceDTO(
    docs: TutorDocs
  ): VerificationDocsServiceDTO {
    return {
      _id: docs._id.toString(),
      tutorId: docs.tutorId.toString(),
      avatar: docs.avatar,
      degree: docs.degree,
      aadharFront: docs.aadharFront,
      aadharBack: docs.aadharBack,
      verificationStatus: docs.verificationStatus,
      submittedAt: docs.submittedAt,
      reviewedAt: docs.reviewedAt,
      rejectionReason: docs.rejectionReason,
    };
  }

  static mapToCreateVerificationDocsDTO(
    tutorId: string,
    avatar: string,
    degree: string,
    aadharFront: string,
    aadharBack: string
  ): CreateVerificationDocsDTO {
    return {
      tutorId,
      avatar,
      degree,
      aadharFront,
      aadharBack,
      verificationStatus: "pending",
      submittedAt: new Date(),
    };
  }

  static mapToUpdateVerificationDocsDTO(
    avatar?: string,
    degree?: string,
    aadharFront?: string,
    aadharBack?: string,
    verificationStatus?: "pending" | "approved" | "rejected",
    rejectionReason?: string
  ): UpdateVerificationDocsDTO {
    const updateData: UpdateVerificationDocsDTO = {};

    if (avatar) updateData.avatar = avatar;
    if (degree) updateData.degree = degree;
    if (aadharFront) updateData.aadharFront = aadharFront;
    if (aadharBack) updateData.aadharBack = aadharBack;
    if (verificationStatus) updateData.verificationStatus = verificationStatus;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;

    updateData.submittedAt = new Date();

    return updateData;
  }

  static mapVerificationDocsArrayToServiceDTO(
    docsArray: TutorDocs[]
  ): VerificationDocsServiceDTO[] {
    return docsArray.map((docs) => this.mapVerificationDocsToServiceDTO(docs));
  }

  static mapTutorArrayToServiceDTO(tutorArray: Tutor[]): TutorServiceDTO[] {
    return tutorArray.map((tutor) => this.mapTutorToServiceDTO(tutor));
  }

  static toListedTutorDTO(tutor: any): ListedTutorDTO {
    return {
      tutorId: tutor._id?.toString() || "",
      name: tutor.name || "",
      email: tutor.email || "",
      avatar: tutor.avatar || undefined,
      designation: tutor.designation || "",
      about: tutor.about || "",
      isVerified: tutor.isVerified || false,
    };
  }

  static toListedTutorDTOArray(tutors: any[]): ListedTutorDTO[] {
    return tutors.map((tutor) => this.toListedTutorDTO(tutor));
  }
}
