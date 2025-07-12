// src/services/admin/AdminService.ts
import { IAdminService } from "../../interfaces/admin/adminServiceInterface";
import { IAdminRepositoryInterface } from "../../interfaces/admin/adminRepositoryInterface";
import { UserDto } from "../../dto/admin/UserDTO";
import { TutorDto } from "../../dto/admin/TutorDTO";
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from "../../dto/admin/CategoryDTO";
import { CategoryMapper } from "../../mappers/admin/CategoryMapper";

export class AdminService implements IAdminService {
  private _adminRepository: IAdminRepositoryInterface;

  constructor(adminRepository: IAdminRepositoryInterface) {
    this._adminRepository = adminRepository;
  }

  async getAllUsers(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ users: UserDto[]; totalPages: number; totalCount: number }> {
    try {
      const result = await this._adminRepository.getAllUsers(skip, limit, search);
      return result;
    } catch (error: any) {
      console.error("Error in AdminService getAllUsers:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async getAllTutors(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ tutors: TutorDto[]; totalPages: number; totalCount: number }> {
    try {
      const result = await this._adminRepository.getAllTutors(skip, limit, search);
      return result;
    } catch (error: any) {
      console.error("Error in AdminService getAllTutors:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async listUnlistUser(id: string): Promise<UserDto> {
    try {
      const user = await this._adminRepository.changeUserStatus(id);
      return user;
    } catch (error: any) {
      console.error("Error in AdminService listUnlistUser:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async listUnlistTutor(id: string): Promise<TutorDto> {
    try {
      const tutor = await this._adminRepository.changeTutorStatus(id);
      return tutor;
    } catch (error: any) {
      console.error("Error in AdminService listUnlistTutor:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async addCourseCategory(data: CreateCategoryDto): Promise<CategoryDto> {
    try {
      const category = await this._adminRepository.addCategory(data);
      return category;
    } catch (error: any) {
      console.error("Error in AdminService addCourseCategory:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async getAllCategories(
  skip: number,
  limit: number,
  search: any
): Promise<{ categories: CategoryDto[]; totalPages: number; totalCount: number }> {
  try {
    // Get raw data from repository
    const result = await this._adminRepository.getAllCategories(skip, limit, search);
    
    // Transform using mapper
    const transformedCategories = CategoryMapper.toDtoArray(result.categories);
    
    return {
      categories: transformedCategories,
      totalPages: result.totalPages,
      totalCount: result.totalCount
    };
  } catch (error: any) {
    console.error("Error in AdminService getAllCategories:", error.message);
    throw error;
  }
}

  async updateCourseCategory(
    categoryId: string,
    updateData: UpdateCategoryDto
  ): Promise<CategoryDto> {
    try {
      const category = await this._adminRepository.updateCategory(categoryId, updateData);
      return category;
    } catch (error: any) {
      console.error("Error in AdminService updateCourseCategory:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async toggleCategoryListStatus(categoryId: string): Promise<CategoryDto> {
    try {
      const category = await this._adminRepository.toggleCategoryStatus(categoryId);
      return category;
    } catch (error: any) {
      console.error("Error in AdminService toggleCategoryListStatus:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }
}