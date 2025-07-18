// services/userService.ts
import { IUserService } from '../../interfaces/user/userServiceInterface';
import { IUserRepository } from '../../interfaces/user/userRepoInterface';
import { UpdateProfileData, UserProfileData, CropData } from '../../interfaces/userInterface/userInterface';
import { S3Service } from '../../utils/s3';
import { cropAndSave } from '../../helper/Sharp';

class UserService implements IUserService {
  private userRepository: IUserRepository;
  private s3Service: S3Service;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.s3Service = new S3Service();
  }

  async updateProfile(
    userId: string, 
    updateData: UpdateProfileData
  ): Promise<{ user: UserProfileData }> {
    console.log("inside service for update profile", userId);
    console.log("updateData received:", updateData);

    // Validate user exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validate name if provided
    if (updateData.name !== undefined) {
      if (!updateData.name || updateData.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      if (updateData.name.trim().length > 50) {
        throw new Error('Name must be less than 50 characters');
      }
      updateData.name = updateData.name.trim();
    }

    // Validate phone if provided
    if (updateData.phone !== undefined) {
      if (!updateData.phone) {
        throw new Error('Phone number is required');
      }
      
      const phoneRegex = /^[0-9]{10,15}$/;
      const cleanPhone = updateData.phone.replace(/\D/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error('Please enter a valid phone number (10-15 digits)');
      }

      // Check if phone is already taken by another user
      const existingPhoneUser = await this.userRepository.findByPhoneExcludingId(cleanPhone, userId);
      if (existingPhoneUser) {
        throw new Error('Phone number is already registered with another account');
      }
      
      updateData.phone = cleanPhone;
    }

    // Validate DOB if provided
    if (updateData.DOB !== undefined && updateData.DOB) {
      const dobDate = new Date(updateData.DOB);
      const today = new Date();
      
      if (dobDate > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      
      // Check if user is at least 13 years old
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 13);
      
      if (dobDate > minAge) {
        throw new Error('User must be at least 13 years old');
      }
    }

    // Validate gender if provided
    if (updateData.gender !== undefined && updateData.gender) {
      if (!['male', 'female', 'other'].includes(updateData.gender)) {
        throw new Error('Invalid gender selection');
      }
    }

    // Handle avatar upload if provided
    if (updateData.avatar && updateData.avatar !== null && typeof updateData.avatar === 'object' && 'buffer' in updateData.avatar) {
      try {
        console.log("Processing avatar upload");
        
        const avatarFile = updateData.avatar as Express.Multer.File;
        let processedBuffer = avatarFile.buffer;

        // Apply crop data if provided
        if (updateData.cropData) {
          const { x, y, width, height } = updateData.cropData;
          console.log("Applying crop data:", updateData.cropData);
          
          processedBuffer = await cropAndSave(x, y, width, height, avatarFile.buffer) as Buffer;
        }

        // Create a processed file object for S3 upload
        const processedFile = {
          ...avatarFile,
          buffer: processedBuffer
        };

        // Delete old avatar from S3 if exists
        if (existingUser.avatar) {
          try {
            await this.s3Service.deleteFile(existingUser.avatar);
            console.log("Old avatar deleted from S3");
          } catch (deleteError) {
            console.warn('Failed to delete old avatar:', deleteError);
            // Continue with upload even if delete fails
          }
        }

        // Upload new avatar to S3 and get the complete S3 key
        const avatarS3Key = await this.s3Service.uploadFile('user_avatars', processedFile);
        
        // Store the complete S3 key path in the database
        updateData.avatar = avatarS3Key;
        console.log("New avatar uploaded:", avatarS3Key);

      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        throw new Error('Failed to upload avatar. Please try again.');
      }
    } else if (updateData.avatar === null) {
      // Handle explicit avatar deletion
      console.log("Deleting avatar");
      
      // Delete old avatar from S3 if exists
      if (existingUser.avatar) {
        try {
          await this.s3Service.deleteFile(existingUser.avatar);
          console.log("Avatar deleted from S3");
        } catch (deleteError) {
          console.warn('Failed to delete avatar:', deleteError);
        }
      }
    }

    // Remove cropData from updateData before saving to database
    const { cropData, ...dataToUpdate } = updateData;

    // Update user profile
    const updatedUser = await this.userRepository.updateProfile(userId, dataToUpdate);
    
    if (!updatedUser) {
      throw new Error('Failed to update profile');
    }

    // Generate avatar URL if avatar exists
    let avatarUrl = null;
    if (updatedUser.avatar) {
      try {
        avatarUrl = await this.s3Service.getFile(updatedUser.avatar);
      } catch (error) {
        console.warn('Failed to generate avatar URL:', error);
      }
    }

    // Format response data according to UserProfileData interface
    const responseData: UserProfileData = {
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      DOB: updatedUser.DOB,
      gender: updatedUser.gender,
      avatar: avatarUrl, // Return the signed URL
      isBlocked: updatedUser.isBlocked,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastLogin: updatedUser.lastLogin
    };

    return { user: responseData };
  }

  async getUserProfile(userId: string): Promise<{ user: UserProfileData }> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Generate avatar URL if avatar exists
    let avatarUrl = null;
    if (user.avatar) {
      try {
        avatarUrl = await this.s3Service.getFile(user.avatar);
      } catch (error) {
        console.warn('Failed to generate avatar URL:', error);
      }
    }

    // Format response data according to UserProfileData interface
    const responseData: UserProfileData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      DOB: user.DOB,
      gender: user.gender,
      avatar: avatarUrl, // Return the signed URL
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin
    };

    return { user: responseData };
  }
}

export default UserService;