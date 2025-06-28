import { Messages } from "../../enums/messages";
import BaseRepository from "../BaseRepository";
import userModel from "../../models/Users";
import tutorModel from "../../models/Tutors";
import adminModel from "../../models/Admin";
import categoryModel from "../../models/CategoryModel";
import {
  Category,
  Tutor,
  User,
} from "../../interfaces/adminInterface/adminInterface";
import { IAdminRepositoryInterface } from "../../interfaces/admin/adminRepositoryInterface";

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
  ): Promise<{ users: User[]; totalPages: number }> {
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

      return { users, totalPages };
    } catch (error: any) {
      console.error("Error in AdminRepository getAllUsers:", error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getAllTutors(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ tutors: Tutor[]; totalPages: number }> {
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

      return { tutors, totalPages };
    } catch (error: any) {
      console.error("Error in AdminRepository getAllTutors:", error.message);
      throw new Error(`Failed to fetch tutors: ${error.message}`);
    }
  }

  async changeUserStatus(id: string): Promise<User> {
    try {
      const user = await this._userRepository.findOne({ _id: id });
      if (!user) {
        throw new Error("User not found");
      }

      user.isBlocked = !user.isBlocked;
      const updatedUser = await user.save();

      return updatedUser;
    } catch (error: any) {
      console.error("Error in AdminRepository changeUserStatus:", error.message);
      throw error; // Re-throw to let service/controller handle
    }
  }

  async changeTutorStatus(id: string): Promise<Tutor> {
    try {
      const tutor = await this._tutorRepository.findOne({ _id: id });
      if (!tutor) {
        throw new Error("Tutor not found");
      }

      tutor.isBlocked = !tutor.isBlocked;
      const updatedTutor = await tutor.save();

      return updatedTutor;
    } catch (error: any) {
      console.error("Error in AdminRepository changeTutorStatus:", error.message);
      throw error; // Re-throw to let service/controller handle
    }
  }

  async addCategory(data: Category): Promise<Category> {
    try {
      // Check if a category with the same name already exists (case-insensitive)
      const existingCategory = await this._categoryRepository.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, 'i') }
      });

      if (existingCategory) {
        throw new Error(`Category with name '${data.name}' already exists`);
      }

      // Create the new category if no duplicate exists
      const newCategory = await this._categoryRepository.create(data as Category);
      return newCategory;
    } catch (error: any) {
      console.error("Error in AdminRepository addCategory:", error.message);
      throw error; // Re-throw to let service/controller handle
    }
  }

  async getAllCategories(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ category: Category[]; totalPages: number }> {
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
      
      return { category: categories, totalPages };
    } catch (error: any) {
      console.error("Error in AdminRepository getAllCategories:", error.message);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async updateCategory(
    categoryId: string,
    updateData: { name: string; description: string }
  ): Promise<Category> {
    try {
      // Check if category exists
      const existingCategory = await this._categoryRepository.findOne({ 
        _id: categoryId 
      });
      
      if (!existingCategory) {
        throw new Error("Category not found");
      }

      // Check if another category with the same name already exists (excluding current category)
      const duplicateCategory = await this._categoryRepository.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: categoryId }
      });

      if (duplicateCategory) {
        throw new Error(`Category with name '${updateData.name}' already exists`);
      }

      // Update the category using BaseRepository's update method
      const updatedCategory = await this._categoryRepository.update(
        categoryId,
        updateData
      );

      if (!updatedCategory) {
        throw new Error("Failed to update category");
      }

      return updatedCategory;
    } catch (error: any) {
      console.error("Error in AdminRepository updateCategory:", error.message);
      throw error; // Re-throw to let service/controller handle
    }
  }

  async toggleCategoryStatus(categoryId: string): Promise<Category> {
    try {
      const category = await this._categoryRepository.findOne({ 
        _id: categoryId 
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

      return updatedCategory;
    } catch (error: any) {
      console.error("Error in AdminRepository toggleCategoryStatus:", error.message);
      throw error; // Re-throw to let service/controller handle
    }
  }
}