// src/interfaces/admin/adminServiceInterface.ts
import { UserDto, PaginatedUsersDto } from "../../dto/admin/UserDTO";
import { TutorDto, PaginatedTutorsDto } from "../../dto/admin/TutorDTO";
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
