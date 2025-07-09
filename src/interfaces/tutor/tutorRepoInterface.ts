import { ITutor, ITutorDocs } from '../tutorInterface/tutorInterface';

export interface ITutorRepository {
  // Tutor methods
  findTutorByEmailOrPhone(email?: string, phone?: string): Promise<ITutor | null>;
  
  // Verification documents methods
  findVerificationDocsByTutorId(tutorId: string): Promise<ITutorDocs | null>;
  createVerificationDocs(documentData: ITutorDocs): Promise<ITutorDocs>;
  updateVerificationDocs(docId: string, updateData: Partial<ITutorDocs>): Promise<ITutorDocs | null>;
  
  // Status-based queries
  findVerificationDocsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<ITutorDocs[]>;
  countVerificationDocsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<number>;
  
  // Pagination
  findVerificationDocsWithPagination(
    filter: object,
    skip: number,
    limit: number
  ): Promise<ITutorDocs[]>;
  
  // Status updates
  updateVerificationStatus(
    docId: string,
    status: 'pending' | 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<ITutorDocs | null>;
  
  // Populated queries
  findVerificationDocsWithTutorInfo(tutorId: string): Promise<any>;
  findAllVerificationDocsWithTutorInfo(): Promise<any[]>;
}