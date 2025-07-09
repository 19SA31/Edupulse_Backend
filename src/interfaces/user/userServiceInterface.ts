// interfaces/user/userServiceInterface.ts
import { UpdateProfileData, UserProfileData } from '../userInterface/userInterface';

export interface IUserService {
  updateProfile(
    userId: string,
    updateData: UpdateProfileData
  ): Promise<{ user: UserProfileData }>;
  
  getUserProfile(userId: string): Promise<{ user: UserProfileData }>;
}