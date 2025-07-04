// services/userService.ts
import { IUserService } from '../../interfaces/user/userServiceInterface';
import { IUserRepository } from '../../interfaces/user/userRepoInterface';
import { UpdateProfileData, UserProfileData } from '../../interfaces/userInterface/userInterface';
import { ResponseModel } from '../../models/ResponseModel';
import   cloudinary  from '../../utils/cloudinary';

class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async updateProfile(
    userId: string, 
    updateData: UpdateProfileData,
    avatarFile?: Express.Multer.File
  ): Promise<ResponseModel<{ user: UserProfileData }>> {
    try {

      console.log("inside service for update profile",userId)
      // Validate user exists
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        return new ResponseModel(false, 'User not found');
      }

      // Validate name if provided
      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim().length < 2) {
          return new ResponseModel(false, 'Name must be at least 2 characters long');
        }
        if (updateData.name.trim().length > 50) {
          return new ResponseModel(false, 'Name must be less than 50 characters');
        }
        updateData.name = updateData.name.trim();
      }

      // Validate phone if provided
      if (updateData.phone !== undefined) {
        if (!updateData.phone) {
          return new ResponseModel(false, 'Phone number is required');
        }
        
        const phoneRegex = /^[0-9]{10,15}$/;
        const cleanPhone = updateData.phone.replace(/\D/g, '');
        
        if (!phoneRegex.test(cleanPhone)) {
          return new ResponseModel(false, 'Please enter a valid phone number (10-15 digits)');
        }

        // Check if phone is already taken by another user
        const existingPhoneUser = await this.userRepository.findByPhoneExcludingId(cleanPhone, userId);
        if (existingPhoneUser) {
          return new ResponseModel(false, 'Phone number is already registered with another account');
        }
        
        updateData.phone = cleanPhone;
      }

      // Validate DOB if provided
      if (updateData.DOB !== undefined && updateData.DOB) {
        const dobDate = new Date(updateData.DOB);
        const today = new Date();
        
        if (dobDate > today) {
          return new ResponseModel(false, 'Date of birth cannot be in the future');
        }
        
        // Check if user is at least 13 years old
        const minAge = new Date();
        minAge.setFullYear(today.getFullYear() - 13);
        
        if (dobDate > minAge) {
          return new ResponseModel(false, 'User must be at least 13 years old');
        }
      }

      // Validate gender if provided
      if (updateData.gender !== undefined && updateData.gender) {
        if (!['male', 'female', 'other'].includes(updateData.gender)) {
          return new ResponseModel(false, 'Invalid gender selection');
        }
      }

      // Handle avatar upload if provided
      if (avatarFile) {
        try {
          // Delete old avatar from cloudinary if exists
          if (existingUser.avatar) {
            try {
              const publicId = this.extractPublicIdFromUrl(existingUser.avatar);
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            } catch (deleteError) {
              console.warn('Failed to delete old avatar:', deleteError);
              // Continue with upload even if delete fails
            }
          }

          // Upload new avatar to cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: 'user_avatars',
                transformation: [
                  { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                  { quality: 'auto', fetch_format: 'auto' }
                ]
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(avatarFile.buffer);
          });

          updateData.avatar = (uploadResult as any).secure_url;
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError);
          return new ResponseModel(false, 'Failed to upload avatar. Please try again.');
        }
      }

      // Update user profile
      const updatedUser = await this.userRepository.updateProfile(userId, updateData);
      
      if (!updatedUser) {
        return new ResponseModel(false, 'Failed to update profile');
      }

      // Format response data according to UserProfileData interface
      const responseData: UserProfileData = {
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        DOB: updatedUser.DOB, // Keep as Date object
        gender: updatedUser.gender,
        avatar: updatedUser.avatar,
        isBlocked: updatedUser.isBlocked,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        lastLogin: updatedUser.lastLogin
      };

      return new ResponseModel(true, 'Profile updated successfully', { user: responseData });

    } catch (error) {
      console.error('Update profile service error:', error);
      return new ResponseModel(false, 'Internal server error');
    }
  }

  async getUserProfile(userId: string): Promise<ResponseModel<{ user: UserProfileData }>> {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return new ResponseModel(false, 'User not found');
      }

      // Format response data according to UserProfileData interface
      const responseData: UserProfileData = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        DOB: user.DOB, // Keep as Date object
        gender: user.gender,
        avatar: user.avatar,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      };

      return new ResponseModel(true, 'Profile retrieved successfully', { user: responseData });

    } catch (error) {
      console.error('Get profile service error:', error);
      return new ResponseModel(false, 'Internal server error');
    }
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      // Extract public_id from cloudinary URL
      const matches = url.match(/\/v\d+\/(.+)\./);
      return matches ? matches[1] : null;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }
}

export default UserService;