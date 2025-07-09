import {
  DocumentFiles,
  ServiceResponse,
  VerificationSubmissionData,
  VerificationStatusData,
  VerificationDocumentsData
} from "../tutorInterface/tutorInterface";

export interface ITutorService {
  submitVerificationDocuments(
    documentFiles: DocumentFiles,
    email?: string,
    phone?: string
  ): Promise<ServiceResponse<VerificationSubmissionData>>;

  getVerificationStatus(
    email?: string,
    phone?: string
  ): Promise<ServiceResponse<VerificationStatusData>>;

  getVerificationDocuments(
    tutorId: string
  ): Promise<ServiceResponse<VerificationDocumentsData>>;
}