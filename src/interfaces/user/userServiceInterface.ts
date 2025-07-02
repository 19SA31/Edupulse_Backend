// interfaces/userInterface/IUserService.ts
import { IUser, UpdateProfileData, UserProfileData } from '../userInterface/userInterface';
import { ResponseModel } from '../../models/ResponseModel';

export interface IUserService {
  updateProfile(
    userId: string, 
    updateData: UpdateProfileData,
    avatarFile?: Express.Multer.File
  ): Promise<ResponseModel<{ user: UserProfileData }>>;
  
  getUserProfile(userId: string): Promise<ResponseModel<{ user: UserProfileData }>>;
}