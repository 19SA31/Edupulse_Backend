import { ITutor, ITutorDocs } from "../tutorInterface/tutorInterface";
import {
  TutorServiceDTO,
  VerificationDocsServiceDTO,
  CreateVerificationDocsDTO,
  UpdateVerificationDocsDTO,
} from "../../dto/tutor/TutorDTO";
import { UpdateProfileData } from "../tutorInterface/tutorInterface";

export interface ITutorRepository {
  
  findTutorByEmailOrPhone(
    email?: string,
    phone?: string
  ): Promise<TutorServiceDTO | null>;
  findById(id: string): Promise<ITutor | null>;
  updateProfile(
    tutorId: string,
    updateData: UpdateProfileData
  ): Promise<ITutor | null>;
  findByPhoneExcludingId(
    phone: string,
    excludeId: string
  ): Promise<TutorServiceDTO | null>;
  findByEmailExcludingId(
    email: string,
    excludeId: string
  ): Promise<TutorServiceDTO | null>;

  
  findVerificationDocsByTutorId(
    tutorId: string
  ): Promise<VerificationDocsServiceDTO | null>;
  createVerificationDocs(
    documentData: CreateVerificationDocsDTO
  ): Promise<VerificationDocsServiceDTO>;
  updateVerificationDocs(
    docId: string,
    updateData: UpdateVerificationDocsDTO
  ): Promise<VerificationDocsServiceDTO | null>;


  findVerificationDocsByStatus(
    status: "pending" | "approved" | "rejected"
  ): Promise<VerificationDocsServiceDTO[]>;
  countVerificationDocsByStatus(
    status: "pending" | "approved" | "rejected"
  ): Promise<number>;


  findVerificationDocsWithPagination(
    filter: object,
    skip: number,
    limit: number
  ): Promise<VerificationDocsServiceDTO[]>;


  updateVerificationStatus(
    docId: string,
    status: "pending" | "approved" | "rejected",
    rejectionReason?: string
  ): Promise<VerificationDocsServiceDTO | null>;

 
  findVerificationDocsWithTutorInfo(tutorId: string): Promise<any>;
  findAllVerificationDocsWithTutorInfo(): Promise<any[]>;
}
