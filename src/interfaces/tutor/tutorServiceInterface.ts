import {
  SubmitVerificationDocumentsRequestDTO,
  SubmitVerificationDocumentsResponseDTO,
  GetVerificationStatusRequestDTO,
  GetVerificationStatusResponseDTO,
  GetVerificationDocumentsRequestDTO,
  GetVerificationDocumentsResponseDTO,
  ListedTutorDTO
} from "../../dto/tutor/TutorDTO";
import { UpdateProfileData, TutorProfileData } from "../tutorInterface/tutorInterface"; 
import { ServiceResponse } from "../tutorInterface/tutorInterface";

export interface ITutorService {
  updateProfile(
    tutorId: string,
    updateData: UpdateProfileData
  ): Promise<{ tutor: TutorProfileData }>;

  getTutorProfile(tutorId: string): Promise<{ tutor: TutorProfileData }>;
  submitVerificationDocuments(
    requestDTO: SubmitVerificationDocumentsRequestDTO
  ): Promise<ServiceResponse<SubmitVerificationDocumentsResponseDTO>>;

  getVerificationStatus(
    requestDTO: GetVerificationStatusRequestDTO
  ): Promise<ServiceResponse<GetVerificationStatusResponseDTO>>;

  getVerificationDocuments(
    requestDTO: GetVerificationDocumentsRequestDTO
  ): Promise<ServiceResponse<GetVerificationDocumentsResponseDTO>>;
    getAllListedTutors(): Promise<ListedTutorDTO[]>;
}
