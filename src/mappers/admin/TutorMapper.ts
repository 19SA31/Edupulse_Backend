// src/mappers/admin/TutorMapper.ts
import { Tutor } from "../../interfaces/adminInterface/adminInterface";
import { TutorDto, PaginatedTutorsDto } from "../../dto/admin/TutorDTO";

export class TutorMapper {
  static toDto(tutor: Tutor): TutorDto {
    return {
      id: tutor._id.toString(),
      name: tutor.name,
      email: tutor.email,
      phone: tutor.phone,
      createdAt: tutor.createdAt.toISOString(),
      isBlocked: tutor.isBlocked,
    };
  }

  static toDtoArray(tutors: Tutor[]): TutorDto[] {
    return tutors.map((tutor) => this.toDto(tutor));
  }

  // Updated method to accept TutorDto[] instead of Tutor[]
  static toPaginatedDto(
    tutors: TutorDto[], // Changed from Tutor[] to TutorDto[]
    totalPages: number,
    currentPage: number,
    totalCount: number
  ): PaginatedTutorsDto {
    return {
      tutors: tutors, // No need to transform since they're already DTOs
      totalPages,
      currentPage,
      totalCount,
    };
  }

  // Keep the original method for when you have full entities
  static toPaginatedDtoFromEntities(
    tutors: Tutor[],
    totalPages: number,
    currentPage: number,
    totalCount: number
  ): PaginatedTutorsDto {
    return {
      tutors: this.toDtoArray(tutors),
      totalPages,
      currentPage,
      totalCount,
    };
  }
}