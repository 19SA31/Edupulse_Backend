import {
  SubmitVerificationDocumentsRequestDTO,
  SubmitVerificationDocumentsResponseDTO,
  GetVerificationStatusRequestDTO,
  GetVerificationStatusResponseDTO,
  GetVerificationDocumentsRequestDTO,
  GetVerificationDocumentsResponseDTO
} from "../../dto/tutor/TutorDTO";
import { ServiceResponse } from "../tutorInterface/tutorInterface";

export interface ITutorService {
  submitVerificationDocuments(
    requestDTO: SubmitVerificationDocumentsRequestDTO
  ): Promise<ServiceResponse<SubmitVerificationDocumentsResponseDTO>>;

  getVerificationStatus(
    requestDTO: GetVerificationStatusRequestDTO
  ): Promise<ServiceResponse<GetVerificationStatusResponseDTO>>;

  getVerificationDocuments(
    requestDTO: GetVerificationDocumentsRequestDTO
  ): Promise<ServiceResponse<GetVerificationDocumentsResponseDTO>>;
}