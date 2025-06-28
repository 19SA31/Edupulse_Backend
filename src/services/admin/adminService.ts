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
  ): Promise<{ tutors: Tutor[]; totalPages: number }> {
    try {
      const result = await this._adminRepository.getAllTutors(skip, limit, search);
      return result;
    } catch (error: any) {
      console.error("Error in AdminService getAllTutors:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async listUnlistUser(id: string): Promise<User> {
    try {
      const user = await this._adminRepository.changeUserStatus(id);
      return user;
    } catch (error: any) {
      console.error("Error in AdminService listUnlistUser:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async listUnlistTutor(id: string): Promise<Tutor> {
    try {
      const tutor = await this._adminRepository.changeTutorStatus(id);
      return tutor;
    } catch (error: any) {
      console.error("Error in AdminService listUnlistTutor:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async addCourseCategory(data: Category): Promise<Category> {
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
  ): Promise<{ category: Category[]; totalPages: number }> {
    try {
      const result = await this._adminRepository.getAllCategories(skip, limit, search);
      return result;
    } catch (error: any) {
      console.error("Error in AdminService getAllCategories:", error.message);
      throw error; // Re-throw to let controller handle
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
      const category = await this._adminRepository.updateCategory(categoryId, updateData);
      return category;
    } catch (error: any) {
      console.error("Error in AdminService updateCourseCategory:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }

  async toggleCategoryListStatus(categoryId: string): Promise<Category> {
    try {
      const category = await this._adminRepository.toggleCategoryStatus(categoryId);
      return category;
    } catch (error: any) {
      console.error("Error in AdminService toggleCategoryListStatus:", error.message);
      throw error; // Re-throw to let controller handle
    }
  }
}