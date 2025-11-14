// interfaces/user/userServiceInterface.ts
import { UpdateProfileData, UserProfileData } from '../userInterface/userInterface';

export interface IUserService {
  ensureUserActive(userId: string): Promise<void>
  updateProfile(
    userId: string,
    updateData: UpdateProfileData
  ): Promise<{ user: UserProfileData }>;
  
  getUserProfile(userId: string): Promise<{ user: UserProfileData }>;
}