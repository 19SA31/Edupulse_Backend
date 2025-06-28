import {
  User,
  Tutor,
  Category,
} from "../../interfaces/adminInterface/adminInterface";

export interface IAdminRepositoryInterface {
  // User methods - return raw data, not ResponseModel
  getAllUsers(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ users: User[]; totalPages: number }>;
  changeUserStatus(id: string): Promise<User>;

  // Tutor methods - return raw data, not ResponseModel
  getAllTutors(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ tutors: Tutor[]; totalPages: number }>;
  changeTutorStatus(id: string): Promise<Tutor>;

  // Category methods - return raw data, not ResponseModel
  addCategory(data: Category): Promise<Category>;
  getAllCategories(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ category: Category[]; totalPages: number }>;
  updateCategory(
    categoryId: string,
    updateData: { name: string; description: string }
  ): Promise<Category>;
  toggleCategoryStatus(categoryId: string): Promise<Category>;
}
