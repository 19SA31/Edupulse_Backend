// src/dtos/admin/TutorDto.ts
export interface TutorDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar:string;
  designation?:string;
  about?:string;
  createdAt: string;
  isBlocked: boolean;
}

export interface PaginatedTutorsDto {
  tutors: TutorDto[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}