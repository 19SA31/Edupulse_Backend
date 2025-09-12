import BaseRepository from "../BaseRepository";
import userModel from "../../models/Users";
import {
  IUser,
  UpdateProfileData,
} from "../../interfaces/userInterface/userInterface";
import { IUserRepository } from "../../interfaces/user/IUserRepository";

class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  
  constructor() {
    super(userModel);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await this.findOne({ _id: id });
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileData
  ): Promise<IUser | null> {
    const updateObject: any = {};

    if (updateData.name !== undefined) updateObject.name = updateData.name;
    if (updateData.phone !== undefined) updateObject.phone = updateData.phone;
    if (updateData.DOB !== undefined) {
      updateObject.DOB = updateData.DOB ? new Date(updateData.DOB) : null;
    }
    if (updateData.gender !== undefined)
      updateObject.gender = updateData.gender;
    if (updateData.avatar !== undefined)
      updateObject.avatar = updateData.avatar;

    return await this.update(userId, updateObject);
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    return await this.findOne({ phone });
  }

  async findByEmailExcludingId(
    email: string,
    excludeId: string
  ): Promise<IUser | null> {
    return await this.findOne({ email, _id: { $ne: excludeId } });
  }

  async findByPhoneExcludingId(
    phone: string,
    excludeId: string
  ): Promise<IUser | null> {
    return await this.findOne({ phone, _id: { $ne: excludeId } });
  }
}

export default UserRepository;
