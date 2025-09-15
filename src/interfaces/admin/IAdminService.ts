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
  
  getAllUsers(
    skip: number,
    limit: number,
    search: string| null
  ): Promise<{ users: UserDto[]; totalPages: number; totalCount: number }>;
  listUnlistUser(id: string): Promise<UserDto>;

  
  getAllTutors(
    skip: number,
    limit: number,
    search: string | null
  ): Promise<{ tutors: TutorDto[]; totalPages: number; totalCount: number }>;
  listUnlistTutor(id: string): Promise<TutorDto>;

  
  getAllTutorDocs(
    skip: number,
    limit: number,
    search: string | null
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

 
  addCourseCategory(data: CreateCategoryDto): Promise<CategoryDto>;
  getAllCategories(
    skip: number,
    limit: number,
    search: string
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
