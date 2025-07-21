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
      avatar: tutor.avatar,
      createdAt: tutor.createdAt.toISOString(),
      isBlocked: tutor.isBlocked,
    };
  }

  static toDtoArray(tutors: Tutor[]): TutorDto[] {
    return tutors.map((tutor) => this.toDto(tutor));
  }

  
  static toPaginatedDto(
    tutors: TutorDto[], 
    totalPages: number,
    currentPage: number,
    totalCount: number
  ): PaginatedTutorsDto {
    return {
      tutors: tutors, 
      totalPages,
      currentPage,
      totalCount,
    };
  }

  
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