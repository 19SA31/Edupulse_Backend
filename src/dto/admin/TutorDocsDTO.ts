// src/dto/admin/TutorDocsDTO.ts
export interface TutorDocsDto {
  id: string;
  tutorId: string;
  tutorName?: string; 
  tutorEmail?: string; 
  avatar: string;
  degree: string;
  aadharFront: string;
  aadharBack: string;
  verificationStatus: 'not_submitted'|'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface TutorVerificationDto{

}


export interface PaginatedTutorDocsDto {
  tutorDocs: TutorDocsDto[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}