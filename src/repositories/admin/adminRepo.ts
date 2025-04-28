import { Messages } from "../../enums/messages";
import BaseRepository from "../BaseRepository";
import userModel from "../../models/Users";
import tutorModel from "../../models/Tutors";
import { Tutor, User } from "../../interfaces/adminInterface/adminInterface";
import { IAdminRepositoryInterface } from "../../interfaces/admin/adminRepositoryInterface";
import { ResponseModel } from "../../models/ResponseModel";

export class AdminRepository
  extends BaseRepository<any>
  implements IAdminRepositoryInterface
{
  private _userRepository = new BaseRepository<any>(userModel);
  private _tutorRepository = new BaseRepository<any>(tutorModel);

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

      const totalPages = Math.ceil(totalCount / limit); // Calculate total pages

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
      const user = await userModel.findOne({ _id: id });
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
      const tutor = await tutorModel.findOne({ _id: id });
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
}
