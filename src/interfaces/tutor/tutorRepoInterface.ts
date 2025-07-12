import { ITutor, ITutorDocs } from '../tutorInterface/tutorInterface';
import {
  TutorServiceDTO,
  VerificationDocsServiceDTO,
  CreateVerificationDocsDTO,
  UpdateVerificationDocsDTO
} from '../../dto/tutor/TutorDTO';

export interface ITutorRepository {
  // Tutor methods
  findTutorByEmailOrPhone(email?: string, phone?: string): Promise<TutorServiceDTO | null>;
  
  // Verification documents methods
  findVerificationDocsByTutorId(tutorId: string): Promise<VerificationDocsServiceDTO | null>;
  createVerificationDocs(documentData: CreateVerificationDocsDTO): Promise<VerificationDocsServiceDTO>;
  updateVerificationDocs(docId: string, updateData: UpdateVerificationDocsDTO): Promise<VerificationDocsServiceDTO | null>;
  
  // Status-based queries
  findVerificationDocsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<VerificationDocsServiceDTO[]>;
  countVerificationDocsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<number>;
  
  // Pagination
  findVerificationDocsWithPagination(
    filter: object,
    skip: number,
    limit: number
  ): Promise<VerificationDocsServiceDTO[]>;
  
  // Status updates
  updateVerificationStatus(
    docId: string,
    status: 'pending' | 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<VerificationDocsServiceDTO | null>;
  
  // Populated queries
  findVerificationDocsWithTutorInfo(tutorId: string): Promise<any>;
  findAllVerificationDocsWithTutorInfo(): Promise<any[]>;
}