// /src/dto/tutor/TutorDTO.ts

export interface SubmitVerificationDocumentsRequestDTO {
  email?: string;
  phone?: string;
  files: {
    avatar: Express.Multer.File
    degree: Express.Multer.File;
    aadharFront: Express.Multer.File;
    aadharBack: Express.Multer.File;
  };
}

export interface SubmitVerificationDocumentsResponseDTO {
  verificationId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

export interface GetVerificationStatusRequestDTO {
  email?: string;
  phone?: string;
}

export interface GetVerificationStatusResponseDTO {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  tutorId: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface GetVerificationDocumentsRequestDTO {
  tutorId: string;
}

export interface GetVerificationDocumentsResponseDTO {
  verificationId: string;
  tutorId: string;
  documents: {
    avatar:string,
    degree: string;
    aadharFront: string;
    aadharBack: string;
  };
  verificationStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface TutorServiceDTO {
  _id: string;
  email?: string;
  phone?: string;
  name?: string;
  isVerified?: boolean;
}

export interface VerificationDocsServiceDTO {
  _id: string;
  tutorId: string;
  avatar: string;
  degree: string;
  aadharFront: string;
  aadharBack: string;
  verificationStatus: 'not_submitted'|'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface CreateVerificationDocsDTO {
  tutorId: string;
  avatar: string;
  degree: string;
  aadharFront: string;
  aadharBack: string;
  verificationStatus: 'not_submitted'|'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

export interface UpdateVerificationDocsDTO {
  avatar?: string
  degree?: string;
  aadharFront?: string;
  aadharBack?: string;
  verificationStatus?: 'not_submitted'|'pending' | 'approved' | 'rejected';
  submittedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}