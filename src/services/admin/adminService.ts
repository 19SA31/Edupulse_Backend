import { IAdminService } from "../../interfaces/admin/adminServiceInterface";
import { IAdminRepositoryInterface } from "../../interfaces/admin/adminRepositoryInterface";
import { Tutor, User } from "../../interfaces/adminInterface/adminInterface";

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
        throw new Error(response.message || "Something went wrong while editing the user.");
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
        throw new Error(response.message || "Something went wrong while editing the tutor.");
      }
    } catch (error: any) {
      console.error("Error in editTutor:", error.message);
      throw new Error(`Failed to edit tutor: ${error.message}`);
    }
  }
}
