import {
  User,
  Tutor,
  Category,
} from "../../interfaces/adminInterface/adminInterface";
import { ITutorDocs } from "../../interfaces/tutorInterface/tutorInterface";

export interface IAdminRepositoryInterface {
  getAllUsers(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ users: User[]; totalPages: number }>;
  changeUserStatus(id: string): Promise<User>;

  getAllTutors(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ tutors: Tutor[]; totalPages: number }>;
  changeTutorStatus(id: string): Promise<Tutor>;

  getAllTutorDocs(
    skip: number,
    limit: number,
    search: string
  ): Promise<{
    tutorDocs: (ITutorDocs & { tutor?: { name: string; email: string } })[];
    totalPages: number;
  }>;
  verifyTutor(tutorId: string): Promise<void>;

  rejectTutor(
    tutorId: string,
    reason: string
  ): Promise<{ tutorEmail: string; tutorName: string } | null>;

  addCategory(data: Category): Promise<Category>;
  findCategoryByName(name: string): Promise<Category | null>;
  getAllCategories(
    skip: number,
    limit: number,
    search: string
  ): Promise<{ category: Category[]; totalPages: number }>;
  updateCategory(
    categoryId: string,
    updateData: Partial<Pick<Category, "name" | "description">>
  ): Promise<Category>;
  toggleCategoryStatus(categoryId: string): Promise<Category>;
}
