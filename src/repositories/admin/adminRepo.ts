import { Messages } from "../../enums/messages";
import BaseRepository from "../BaseRepository";
import userModel from "../../models/Users";
import tutorModel from "../../models/Tutors";
import adminModel from "../../models/Admin";
import categoryModel from "../../models/CategoryModel";
import { TutorDocs } from "../../models/TutorDocs";
import { ITutorDocs } from "../../interfaces/tutorInterface/tutorInterface";
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
  private _tutorDocsRepository = new BaseRepository<any>(TutorDocs);

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
      console.error(
        "Error in AdminRepository changeUserStatus:",
        error.message
      );
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
      console.error(
        "Error in AdminRepository changeTutorStatus:",
        error.message
      );
      throw error; // Re-throw to let service/controller handle
    }
  }

  async addCategory(data: Category): Promise<Category> {
    try {
      // Check if a category with the same name already exists (case-insensitive)
      const existingCategory = await this._categoryRepository.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
      });

      if (existingCategory) {
        throw new Error(`Category with name '${data.name}' already exists`);
      }

      // Create the new category if no duplicate exists
      const newCategory = await this._categoryRepository.create(
        data as Category
      );
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
      console.error(
        "Error in AdminRepository getAllCategories:",
        error.message
      );
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
        _id: categoryId,
      });

      if (!existingCategory) {
        throw new Error("Category not found");
      }

      // Check if another category with the same name already exists (excluding current category)
      const duplicateCategory = await this._categoryRepository.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
        _id: { $ne: categoryId },
      });

      if (duplicateCategory) {
        throw new Error(
          `Category with name '${updateData.name}' already exists`
        );
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

      return updatedCategory;
    } catch (error: any) {
      console.error(
        "Error in AdminRepository toggleCategoryStatus:",
        error.message
      );
      throw error; // Re-throw to let service/controller handle
    }
  }

  async getAllTutorDocs(
    skip: number,
    limit: number,
    search: string
  ): Promise<{
    tutorDocs: (ITutorDocs & { tutor?: { name: string; email: string } })[];
    totalPages: number;
  }> {
    try {
      let pipeline: any[] = [];

      // Add search filter if provided
      if (search) {
        pipeline.push({
          $lookup: {
            from: "tutors", // Collection name for tutors
            localField: "tutorId",
            foreignField: "_id",
            as: "tutor",
          },
        });
        pipeline.push({
          $unwind: {
            path: "$tutor",
            preserveNullAndEmptyArrays: true,
          },
        });
        pipeline.push({
          $match: {
            $or: [
              { "tutor.name": { $regex: search, $options: "i" } },
              { "tutor.email": { $regex: search, $options: "i" } },
              { verificationStatus: { $regex: search, $options: "i" } },
            ],
          },
        });
      } else {
        // Always populate tutor information
        pipeline.push({
          $lookup: {
            from: "tutors",
            localField: "tutorId",
            foreignField: "_id",
            as: "tutor",
          },
        });
        pipeline.push({
          $unwind: {
            path: "$tutor",
            preserveNullAndEmptyArrays: true,
          },
        });
      }

      // Add pagination
      pipeline.push(
        { $sort: { submittedAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      );

      // Execute aggregation pipeline
      const tutorDocs = await this._tutorDocsRepository.aggregate(pipeline);

      // Get total count for pagination
      const countPipeline = pipeline.slice(0, -2); // Remove skip and limit
      countPipeline.push({ $count: "total" });
      const countResult = await this._tutorDocsRepository.aggregate(
        countPipeline
      );
      const totalCount = countResult[0]?.total || 0;

      const totalPages = Math.ceil(totalCount / limit);

      return { tutorDocs, totalPages };
    } catch (error: any) {
      console.error("Error in AdminRepository getAllTutorDocs:", error.message);
      throw new Error(`Failed to fetch tutor docs: ${error.message}`);
    }
  }

  async verifyTutor(tutorId: string): Promise<void> {
    try {
      // Find the tutor docs first
      const tutorDocs = await this._tutorDocsRepository.findOne({
        tutorId: tutorId,
      });

      if (!tutorDocs) {
        throw new Error("Tutor not found");
      }

      // Update tutor docs status to verified
      await this._tutorDocsRepository.update(tutorDocs._id.toString(), {
        isVerified: true,
        verificationStatus: "verified",
      });

      // Update tutor isVerified to true
      await this._tutorRepository.update(tutorId, {
        isVerified: true,
      });
    } catch (error: any) {
      console.error("Error in AdminRepository verifyTutor:", error.message);
      throw error;
    }
  }

  async rejectTutor(
    tutorId: string,
    reason: string
  ): Promise<{ tutorEmail: string; tutorName: string } | null> {
    try {
      // Find the tutor docs first
      const tutorDocs = await this._tutorDocsRepository.findOne({
        tutorId: tutorId,
      });

      if (!tutorDocs) {
        throw new Error("Tutor not found");
      }

      // Get tutor info for email
      const tutor = await this._tutorRepository.findOne({ _id: tutorId });

      if (!tutor) {
        throw new Error("Tutor not found");
      }

      // Update tutor docs status to rejected
      await this._tutorDocsRepository.update(tutorDocs._id.toString(), {
        verificationStatus: "rejected",
        rejectionReason: reason,
        reviewedAt: new Date(),
      });

      // Note: isVerified is already false by default, so no need to update tutor table

      return {
        tutorEmail: tutor.email,
        tutorName: tutor.name,
      };
    } catch (error: any) {
      console.error("Error in AdminRepository rejectTutor:", error.message);
      throw error;
    }
  }
}
