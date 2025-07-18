// src/mappers/admin/TutorDocsMapper.ts
import { ITutorDocs } from "../../interfaces/tutorInterface/tutorInterface";
import { TutorDocsDto, PaginatedTutorDocsDto } from "../../dto/admin/TutorDocsDTO";


export class TutorDocsMapper {
  static toDto(tutorDocs: ITutorDocs & { tutor?: { name: string; email: string } }): TutorDocsDto {
    return {
      id: tutorDocs._id.toString(),
      tutorId: tutorDocs.tutorId.toString(),
      tutorName: tutorDocs.tutor?.name,
      tutorEmail: tutorDocs.tutor?.email,
      avatar: tutorDocs.avatar,
      degree: tutorDocs.degree,
      aadharFront: tutorDocs.aadharFront,
      aadharBack: tutorDocs.aadharBack,
      verificationStatus: tutorDocs.verificationStatus,
      submittedAt: tutorDocs.submittedAt.toISOString(),
      reviewedAt: tutorDocs.reviewedAt?.toISOString(),
      rejectionReason: tutorDocs.rejectionReason,
    };
  }

  static toDtoArray(tutorDocsArray: (ITutorDocs & { tutor?: { name: string; email: string } })[]): TutorDocsDto[] {
    return tutorDocsArray.map((tutorDocs) => this.toDto(tutorDocs));
  }

  static toPaginatedDto(
    tutorDocs: TutorDocsDto[],
    totalPages: number,
    currentPage: number,
    totalCount: number
  ): PaginatedTutorDocsDto {
    return {
      tutorDocs,
      totalPages,
      currentPage,
      totalCount,
    };
  }

  static toPaginatedDtoFromEntities(
    tutorDocsArray: (ITutorDocs & { tutor?: { name: string; email: string } })[],
    totalPages: number,
    currentPage: number,
    totalCount: number
  ): PaginatedTutorDocsDto {
    return {
      tutorDocs: this.toDtoArray(tutorDocsArray),
      totalPages,
      currentPage,
      totalCount,
    };
  }
}