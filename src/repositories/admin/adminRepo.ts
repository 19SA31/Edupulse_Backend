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
import { ResponseModel } from "../../models/ResponseModel";

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
  ): Promise<ResponseModel<{ users: User[]; totalPages: number }>> {
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

      return new ResponseModel(true, Messages.FETCH_SUCCESS, {
        users,
        totalPages,
      });
    } catch (error: any) {
      console.error("Error in AdminRepository:", error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getAllTutors(
    skip: number,
    limit: number,
    search: string
  ): Promise<ResponseModel<{ tutors: Tutor[]; totalPages: number }>> {
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

      const totalPages = Math.ceil(totalCount / limit); // Calculate total pages

      return new ResponseModel(true, Messages.FETCH_SUCCESS, {
        tutors,
        totalPages,
      });
    } catch (error: any) {
      console.error("Error in AdminRepository:", error.message);
      throw new Error(`Failed to fetch Tutors: ${error.message}`);
    }
  }

  async changeUserStatus(id: string): Promise<ResponseModel<User>> {
    try {
      const user = await this._userRepository.findOne({ _id: id });
      if (!user) {
        return new ResponseModel<User>(false, "User not found", null);
      }

      user.isBlocked = !user.isBlocked;
      const updatedUser = await user.save();

      return new ResponseModel<User>(
        true,
        "User status updated successfully",
        updatedUser
      );
    } catch (error: any) {
      console.error("Error updating user:", error.message);
      return new ResponseModel<User>(false, error.message, null);
    }
  }

  async changeTutorStatus(id: string): Promise<ResponseModel<Tutor>> {
    try {
      const tutor = await this._tutorRepository.findOne({ _id: id });
      if (!tutor) {
        return new ResponseModel<Tutor>(false, "Tutor not found", null);
      }

      tutor.isBlocked = !tutor.isBlocked;
      const updatedTutor = await tutor.save();

      return new ResponseModel<Tutor>(
        true,
        "Tutor status updated successfully",
        updatedTutor
      );
    } catch (error: any) {
      console.error("Error updating tutor:", error.message);
      return new ResponseModel<Tutor>(false, error.message, null);
    }
  }

  async addCategory(data: Category): Promise<ResponseModel<Category | null>> {
  try {
    // Check if a category with the same name already exists (case-insensitive)
    const existingCategory = await this._categoryRepository.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, 'i') }
    });

    if (existingCategory) {
      return new ResponseModel(
        false,
        `Category with name '${data.name}' already exists`,
        null
      );
    }

    // Create the new category if no duplicate exists
    const newCategory = await this._categoryRepository.create(
      data as Category
    );
    return new ResponseModel(
      true,
      "Category created successfully",
      newCategory
    );
  } catch (error: unknown) {
    console.error("Error in adding category:", (error as Error).message);
    return new ResponseModel(false, "Failed to create category", null);
  }
}

  async getAllCategories(
    skip: number,
    limit: number,
    search: string
  ): Promise<ResponseModel<{ category: Category[]; totalPages: number }|null>> {
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
      return new ResponseModel(true, Messages.FETCH_SUCCESS, {
        category:categories,
        totalPages,
      });
    } catch (error: any) {
      console.error("Error fetching categories:", error.message);
      return new ResponseModel(false, "Failed to fetch categories", null);
    }
  }

  async updateCategory(
  categoryId: string,
  updateData: { name: string; description: string }
): Promise<ResponseModel<Category>> {
  try {
    // Check if category exists
    const existingCategory = await this._categoryRepository.findOne({ 
      _id: categoryId 
    });
    
    if (!existingCategory) {
      return new ResponseModel<Category>(false, "Category not found", null);
    }

    // Check if another category with the same name already exists (excluding current category)
    const duplicateCategory = await this._categoryRepository.findOne({
      name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
      _id: { $ne: categoryId }
    });

    if (duplicateCategory) {
      return new ResponseModel<Category>(
        false, 
        `Category with name '${updateData.name}' already exists`, 
        null
      );
    }

    // Update the category using BaseRepository's update method
    const updatedCategory = await this._categoryRepository.update(
      categoryId,
      updateData
    );

    if (!updatedCategory) {
      return new ResponseModel<Category>(false, "Failed to update category", null);
    }

    return new ResponseModel<Category>(
      true,
      "Category updated successfully",
      updatedCategory
    );
  } catch (error: any) {
    console.error("Error updating category:", error.message);
    return new ResponseModel<Category>(false, error.message, null);
  }
}

  async toggleCategoryStatus(categoryId: string): Promise<ResponseModel<Category>> {
  try {
    const category = await this._categoryRepository.findOne({ 
      _id: categoryId 
    });
    
    if (!category) {
      return new ResponseModel<Category>(false, "Category not found", null);
    }

    // Toggle the isListed status and update using BaseRepository's update method
    const updatedCategory = await this._categoryRepository.update(
      categoryId,
      { isListed: !category.isListed }
    );

    if (!updatedCategory) {
      return new ResponseModel<Category>(false, "Failed to update category status", null);
    }

    return new ResponseModel<Category>(
      true,
      "Category status updated successfully",
      updatedCategory
    );
  } catch (error: any) {
    console.error("Error toggling category status:", error.message);
    return new ResponseModel<Category>(false, error.message, null);
  }
}
}
