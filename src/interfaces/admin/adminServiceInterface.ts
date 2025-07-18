// src/interfaces/admin/adminServiceInterface.ts
import { UserDto, PaginatedUsersDto } from "../../dto/admin/UserDTO";
import { TutorDto, PaginatedTutorsDto } from "../../dto/admin/TutorDTO";
import { TutorDocsDto } from "../../dto/admin/TutorDocsDTO";
import {
  CategoryDto,
  PaginatedCategoriesDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../dto/admin/CategoryDTO";

export interface IAdminService {
  // User methods - return DTOs
  getAllUsers(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ users: UserDto[]; totalPages: number; totalCount: number }>;
  listUnlistUser(id: string): Promise<UserDto>;

  // Tutor methods - return DTOs
  getAllTutors(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ tutors: TutorDto[]; totalPages: number; totalCount: number }>;
  listUnlistTutor(id: string): Promise<TutorDto>;

  // TutorDocs methods - return DTOs
  getAllTutorDocs(
    skip: number,
    limit: number,
    search: any
  ): Promise<{
    tutorDocs: TutorDocsDto[];
    totalPages: number;
    totalCount: number;
  }>;

  verifyTutor(tutorId: string): Promise<{ success: boolean; message?: string }>;

  rejectTutor(
    tutorId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message?: string;
    tutorEmail?: string;
    tutorName?: string;
  }>;

  // Category methods - return DTOs
  addCourseCategory(data: CreateCategoryDto): Promise<CategoryDto>;
  getAllCategories(
    skip: number,
    limit: number,
    search: any
  ): Promise<{
    categories: CategoryDto[];
    totalPages: number;
    totalCount: number;
  }>;
  updateCourseCategory(
    categoryId: string,
    updateData: UpdateCategoryDto
  ): Promise<CategoryDto>;
  toggleCategoryListStatus(categoryId: string): Promise<CategoryDto>;
}
