// interfaces/userInterface/IUserRepository.ts
import { IUser, UpdateProfileData } from '../userInterface/userInterface';

export interface IUserRepository {

  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  updateProfile(userId: string, updateData: UpdateProfileData): Promise<IUser | null>;
  findByPhone(phone: string): Promise<IUser | null>;
  findByEmailExcludingId(email: string, excludeId: string): Promise<IUser | null>;
  findByPhoneExcludingId(phone: string, excludeId: string): Promise<IUser | null>;
}