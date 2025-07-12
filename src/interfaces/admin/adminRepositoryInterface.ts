// src/interfaces/admin/adminRepositoryInterface.ts
import { UserDto, PaginatedUsersDto } from "../../dto/admin/UserDTO";
import { TutorDto, PaginatedTutorsDto } from "../../dto/admin/TutorDTO";
import {
  CategoryDto,
  PaginatedCategoriesDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../dto/admin/CategoryDTO";
import { ICategory } from "../adminInterface/adminInterface"; 

export interface IAdminRepositoryInterface {
  // User methods - return DTOs
  getAllUsers(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ users: UserDto[]; totalPages: number; totalCount: number }>;
  changeUserStatus(id: string): Promise<UserDto>;

  // Tutor methods - return DTOs
  getAllTutors(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ tutors: TutorDto[]; totalPages: number; totalCount: number }>;
  changeTutorStatus(id: string): Promise<TutorDto>;

  // Category methods - return DTOs
  addCategory(data: CreateCategoryDto): Promise<CategoryDto>;
  getAllCategories(
  skip: number,
  limit: number,
  search: string
): Promise<{
  categories: ICategory[]; 
  totalPages: number;
  totalCount: number;
}>;
  updateCategory(
    categoryId: string,
    updateData: UpdateCategoryDto
  ): Promise<CategoryDto>;
  toggleCategoryStatus(categoryId: string): Promise<CategoryDto>;
}
