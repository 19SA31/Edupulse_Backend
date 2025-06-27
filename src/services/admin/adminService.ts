import { IAdminService } from "../../interfaces/admin/adminServiceInterface";
import { IAdminRepositoryInterface } from "../../interfaces/admin/adminRepositoryInterface";
import {
  Tutor,
  User,
  Category,
} from "../../interfaces/adminInterface/adminInterface";

export class AdminService implements IAdminService {
  private _adminRepository: IAdminRepositoryInterface;

  constructor(adminRepository: IAdminRepositoryInterface) {
    this._adminRepository = adminRepository;
  }

  async getAllUsers(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ users: User[]; totalPages: number }> {
    try {
      const { data } = await this._adminRepository.getAllUsers(
        skip,
        limit,
        search
      );
      if (!data) throw new Error("No data found");

      const { users, totalPages } = data;

      return { users, totalPages };
    } catch (error: any) {
      console.error("Error in AdminService:", error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getAllTutors(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ tutors: Tutor[]; totalPages: number }> {
    try {
      const { data } = await this._adminRepository.getAllTutors(
        skip,
        limit,
        search
      );

      if (!data) throw new Error("No data found");

      const { tutors, totalPages } = data;

      return { tutors, totalPages };
    } catch (error: any) {
      console.error("Error in AdminService:", error.message);
      throw new Error(`Failed to fetch tutors: ${error.message}`);
    }
  }

  async listUnlistUser(id: string): Promise<User> {
    try {
      const response = await this._adminRepository.changeUserStatus(id);

      if (response && response.success && response.data) {
        return response.data;
      } else {
        console.error("Failed to edit user: Response is invalid", response);
        throw new Error(
          response.message || "Something went wrong while editing the user."
        );
      }
    } catch (error: any) {
      console.error("Error in edituser:", error.message);
      throw new Error(`Failed to edit user: ${error.message}`);
    }
  }

  async listUnlistTutor(id: string): Promise<Tutor> {
    try {
      const response = await this._adminRepository.changeTutorStatus(id);

      if (response && response.success && response.data) {
        return response.data;
      } else {
        console.error("Failed to edit tutor: Response is invalid", response);
        throw new Error(
          response.message || "Something went wrong while editing the tutor."
        );
      }
    } catch (error: any) {
      console.error("Error in editTutor:", error.message);
      throw new Error(`Failed to edit tutor: ${error.message}`);
    }
  }

  async addCourseCategory(data: Category): Promise<Category> {
    try {
      const categoryResponse = await this._adminRepository.addCategory(data);
      if (!categoryResponse.success || !categoryResponse.data) {
        throw new Error(categoryResponse.message || "Failed to add category");
      }
      return categoryResponse.data;
    } catch (error: any) {
      console.error("error in addCourseCategory:", error.message);
      throw new Error("Failed to add category");
    }
  }

  async getAllCategories(
    skip: number,
    limit: number,
    search: any
  ): Promise<{ category: Category[]; totalPages: number }> {
    try {
      const { data } = await this._adminRepository.getAllCategories(
        skip,
        limit,
        search
      );

      if (!data) throw new Error("No data found");
      const { category, totalPages } = data;

      return { category, totalPages };
    } catch (error: any) {
      console.error("Error in getAllCategories:", error.message);
      throw new Error("Failed to get categories");
    }
  }

  async updateCourseCategory(
    categoryId: string,
    updateData: {
      name: string;
      description: string;
    }
  ): Promise<Category> {
    try {
      const response = await this._adminRepository.updateCategory(
        categoryId,
        updateData
      );

      if (response && response.success && response.data) {
        return response.data;
      } else {
        console.error("Failed to update category: Response is invalid", response);
        throw new Error(
          response.message || "Something went wrong while updating the category."
        );
      }
    } catch (error: any) {
      console.error("Error in updateCourseCategory:", error.message);
      
      // Handle specific error cases that your controller expects
      if (error.message.includes("not found") || error.message.includes("Category not found")) {
        throw new Error("Category not found");
      } else if (error.message.includes("already exists")) {
        throw new Error(error.message);
      } else {
        throw new Error(`Failed to update category: ${error.message}`);
      }
    }
  }

  
  async toggleCategoryListStatus(categoryId: string): Promise<Category> {
    try {
      const response = await this._adminRepository.toggleCategoryStatus(categoryId);

      if (response && response.success && response.data) {
        return response.data;
      } else {
        console.error("Failed to toggle category status: Response is invalid", response);
        throw new Error(
          response.message || "Something went wrong while toggling category status."
        );
      }
    } catch (error: any) {
      console.error("Error in toggleCategoryListStatus:", error.message);
      
      // Handle specific error cases that your controller expects
      if (error.message.includes("not found") || error.message.includes("Category not found")) {
        throw new Error("Category not found");
      } else {
        throw new Error(`Failed to toggle category status: ${error.message}`);
      }
    }
  }
}
