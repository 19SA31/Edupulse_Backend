// src/repositories/admin/AdminRepository.ts
import { Messages } from "../../enums/messages";
import BaseRepository from "../BaseRepository";
import userModel from "../../models/Users";
import tutorModel from "../../models/Tutors";
import adminModel from "../../models/Admin";
import categoryModel from "../../models/CategoryModel";
import { ICategory } from "../../interfaces/adminInterface/adminInterface";
import { IAdminRepositoryInterface } from "../../interfaces/admin/adminRepositoryInterface";
import { UserMapper } from "../../mappers/admin/UserMapper";
import { TutorMapper } from "../../mappers/admin/TutorMapper";
import { CategoryMapper } from "../../mappers/admin/CategoryMapper";
import { UserDto } from "../../dto/admin/UserDTO";
import { TutorDto } from "../../dto/admin/TutorDTO";
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../dto/admin/CategoryDTO";

export class AdminRepository
  extends BaseRepository<any>
  implements IAdminRepositoryInterface
{
  constructor() {
    super(adminModel);
  }

  private _userRepository = new BaseRepository<any>(userModel);
  private _tutorRepository = new BaseRepository<any>(tutorModel);
  private _categoryRepository = new BaseRepository<any>(categoryModel);

  async getAllUsers(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ users: UserDto[]; totalPages: number; totalCount: number }> {
    try {
      const searchFilter = search
        ? {
            name: { $regex: search, $options: "i" },
          }
        : {};

      const users = await this._userRepository.findWithPagination(
        searchFilter,
        skip,
        limit
      );
      const totalCount = await this._userRepository.countDocuments(
        searchFilter
      );

      const totalPages = Math.ceil(totalCount / limit);

      // Map to DTOs
      const userDtos = UserMapper.toDtoArray(users);

      return { users: userDtos, totalPages, totalCount };
    } catch (error: any) {
      console.error("Error in AdminRepository getAllUsers:", error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getAllTutors(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ tutors: TutorDto[]; totalPages: number; totalCount: number }> {
    try {
      const searchFilter = search
        ? {
            name: { $regex: search, $options: "i" },
          }
        : {};

      const tutors = await this._tutorRepository.findWithPagination(
        searchFilter,
        skip,
        limit
      );

      const totalCount = await this._tutorRepository.countDocuments(
        searchFilter
      );

      const totalPages = Math.ceil(totalCount / limit);

      // Map to DTOs
      const tutorDtos = TutorMapper.toDtoArray(tutors);

      return { tutors: tutorDtos, totalPages, totalCount };
    } catch (error: any) {
      console.error("Error in AdminRepository getAllTutors:", error.message);
      throw new Error(`Failed to fetch tutors: ${error.message}`);
    }
  }

  async changeUserStatus(id: string): Promise<UserDto> {
    try {
      const user = await this._userRepository.findOne({ _id: id });
      if (!user) {
        throw new Error("User not found");
      }

      user.isBlocked = !user.isBlocked;
      const updatedUser = await user.save();

      // Map to DTO
      return UserMapper.toDto(updatedUser);
    } catch (error: any) {
      console.error(
        "Error in AdminRepository changeUserStatus:",
        error.message
      );
      throw error; // Re-throw to let service/controller handle
    }
  }

  async changeTutorStatus(id: string): Promise<TutorDto> {
    try {
      const tutor = await this._tutorRepository.findOne({ _id: id });
      if (!tutor) {
        throw new Error("Tutor not found");
      }

      tutor.isBlocked = !tutor.isBlocked;
      const updatedTutor = await tutor.save();

      // Map to DTO
      return TutorMapper.toDto(updatedTutor);
    } catch (error: any) {
      console.error(
        "Error in AdminRepository changeTutorStatus:",
        error.message
      );
      throw error; // Re-throw to let service/controller handle
    }
  }

  async addCategory(data: CreateCategoryDto): Promise<CategoryDto> {
    try {
      // Check if a category with the same name already exists (case-insensitive)
      const existingCategory = await this._categoryRepository.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
      });

      if (existingCategory) {
        throw new Error(`Category with name '${data.name}' already exists`);
      }

      // Convert DTO to domain model
      const categoryData = CategoryMapper.fromCreateDto(data);

      // Create the new category if no duplicate exists
      const newCategory = await this._categoryRepository.create(categoryData);

      // Map to DTO
      return CategoryMapper.toDto(newCategory);
    } catch (error: any) {
      console.error("Error in AdminRepository addCategory:", error.message);
      throw error; // Re-throw to let service/controller handle
    }
  }

  async getAllCategories(
    skip: number,
    limit: number,
    search: string
  ): Promise<{
    categories: ICategory[]; // Return raw data
    totalPages: number;
    totalCount: number;
  }> {
    try {
      const searchFilter = search
        ? {
            name: { $regex: search, $options: "i" },
          }
        : {};

      const categories = await this._categoryRepository.findWithPagination(
        searchFilter,
        skip,
        limit
      );

      const totalCount = await this._categoryRepository.countDocuments(
        searchFilter
      );

      const totalPages = Math.ceil(totalCount / limit);

      // Return raw categories without mapping
      return { categories, totalPages, totalCount };
    } catch (error: any) {
      console.error(
        "Error in AdminRepository getAllCategories:",
        error.message
      );
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async updateCategory(
    categoryId: string,
    updateData: UpdateCategoryDto
  ): Promise<CategoryDto> {
    try {
      // Check if category exists
      const existingCategory = await this._categoryRepository.findOne({
        _id: categoryId,
      });

      if (!existingCategory) {
        throw new Error("Category not found");
      }

      // Convert DTO to domain model
      const domainUpdateData = CategoryMapper.fromUpdateDto(updateData);

      // Check if another category with the same name already exists (excluding current category)
      if (domainUpdateData.name) {
        const duplicateCategory = await this._categoryRepository.findOne({
          name: { $regex: new RegExp(`^${domainUpdateData.name}$`, "i") },
          _id: { $ne: categoryId },
        });

        if (duplicateCategory) {
          throw new Error(
            `Category with name '${domainUpdateData.name}' already exists`
          );
        }
      }

      // Update the category using BaseRepository's update method
      const updatedCategory = await this._categoryRepository.update(
        categoryId,
        domainUpdateData
      );

      if (!updatedCategory) {
        throw new Error("Failed to update category");
      }

      // Map to DTO
      return CategoryMapper.toDto(updatedCategory);
    } catch (error: any) {
      console.error("Error in AdminRepository updateCategory:", error.message);
      throw error; // Re-throw to let service/controller handle
    }
  }

  async toggleCategoryStatus(categoryId: string): Promise<CategoryDto> {
    try {
      const category = await this._categoryRepository.findOne({
        _id: categoryId,
      });

      if (!category) {
        throw new Error("Category not found");
      }

      // Toggle the isListed status and update using BaseRepository's update method
      const updatedCategory = await this._categoryRepository.update(
        categoryId,
        { isListed: !category.isListed }
      );

      if (!updatedCategory) {
        throw new Error("Failed to update category status");
      }

      // Map to DTO
      return CategoryMapper.toDto(updatedCategory);
    } catch (error: any) {
      console.error(
        "Error in AdminRepository toggleCategoryStatus:",
        error.message
      );
      throw error; // Re-throw to let service/controller handle
    }
  }
}
