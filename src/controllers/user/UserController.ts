import { Request, Response } from 'express';
import { IUserService } from '../../interfaces/user/userServiceInterface';
import { ResponseModel } from '../../models/ResponseModel';
import { UpdateProfileData, CropData } from '../../interfaces/userInterface/userInterface';
import HTTP_statusCode from '../../enums/HttpStatusCode';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log("Inside controller for update profile");
      console.log("Request body:", req.body);
      console.log("Request file:", req.file ? 'File present' : 'No file');

      // Get user ID from authenticated user (from token)
      const userId = req.body?.id;
      
      if (!userId) {
        console.log("No user ID found in token");
        res.status(HTTP_statusCode.Unauthorized).json(
          new ResponseModel(false, 'Unauthorized: User not authenticated')
        );
        return;
      }

      console.log("Authenticated user ID:", userId);

      // Get avatar file if uploaded
      const avatarFile = req.file;
      
      // Handle crop data if provided
      let cropData: CropData | undefined;
      if (req.body.cropData) {
        try {
          cropData = JSON.parse(req.body.cropData);
          console.log("Crop data received:", cropData);
          
          // Validate crop data structure
          if (cropData && typeof cropData === 'object') {
            const { x, y, width, height } = cropData;
            if (typeof x !== 'number' || typeof y !== 'number' || 
                typeof width !== 'number' || typeof height !== 'number') {
              console.log("Invalid crop data structure");
              res.status(HTTP_statusCode.BadRequest).json(
                new ResponseModel(false, 'Invalid crop data structure')
              );
              return;
            }

            // Validate crop data values
            if (x < 0 || y < 0 || width <= 0 || height <= 0) {
              console.log("Invalid crop data values");
              res.status(HTTP_statusCode.BadRequest).json(
                new ResponseModel(false, 'Invalid crop data values')
              );
              return;
            }
          }
        } catch (error) {
          console.log("Invalid crop data format");
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'Invalid crop data format')
          );
          return;
        }
      }

      // Additional validation for avatar file
      if (avatarFile) {
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (avatarFile.size > maxSize) {
          console.log("File size exceeds limit");
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'File size exceeds 5MB limit')
          );
          return;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(avatarFile.mimetype)) {
          console.log("Invalid file type");
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'Only JPEG, PNG, GIF, and WebP images are allowed')
          );
          return;
        }

        // If crop data is provided, validate it against image dimensions
        if (cropData && avatarFile.buffer) {
          // This is a basic validation - you might want to use Sharp to get actual image dimensions
          const { x, y, width, height } = cropData;
          
          // Basic sanity check - ensure crop area is reasonable
          if (width > 5000 || height > 5000) {
            console.log("Crop area too large");
            res.status(HTTP_statusCode.BadRequest).json(
              new ResponseModel(false, 'Crop area is too large')
            );
            return;
          }
        }
      }

      // Build update data object including file and crop data
      const updateData: UpdateProfileData = {};
      
      // Handle text fields from form data
      if (req.body.name && req.body.name.trim()) {
        updateData.name = req.body.name.trim();
      }
      if (req.body.phone && req.body.phone.trim()) {
        updateData.phone = req.body.phone.trim();
      }
      if (req.body.DOB) {
        updateData.DOB = req.body.DOB;
      }
      if (req.body.gender) {
        updateData.gender = req.body.gender;
      }

      // Add avatar file to update data if present
      if (avatarFile) {
        updateData.avatar = avatarFile;
      }

      // Add crop data to update data if present
      if (cropData) {
        updateData.cropData = cropData;
      }

      console.log("Update data:", updateData);
      console.log("Avatar file:", avatarFile ? {
        originalname: avatarFile.originalname,
        mimetype: avatarFile.mimetype,
        size: avatarFile.size
      } : 'No avatar file');

      // Validate that at least one field is being updated
      if (Object.keys(updateData).length === 0) {
        console.log("No data provided for update");
        res.status(HTTP_statusCode.BadRequest).json(
          new ResponseModel(false, 'No data provided for update')
        );
        return;
      }

      // Call service to update profile
      const result = await this.userService.updateProfile(userId, updateData);

      console.log("*********",result)
      console.log("Service result:", {
        success: !!result.user,
        hasData: !!result.user
      });

      // Send success response
      res.status(HTTP_statusCode.OK).json(
        new ResponseModel(true, 'Profile updated successfully', result)
      );

    } catch (error) {
      console.error('Update profile controller error:', error);
      
      // Handle specific service errors
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Handle validation errors
        if (errorMessage.includes('Name must be') || 
            errorMessage.includes('Phone number') || 
            errorMessage.includes('Date of birth') || 
            errorMessage.includes('User must be') || 
            errorMessage.includes('Invalid gender') ||
            errorMessage.includes('already registered')) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, errorMessage)
          );
          return;
        }
        
        // Handle not found errors
        if (errorMessage.includes('User not found')) {
          res.status(HTTP_statusCode.NotFound).json(
            new ResponseModel(false, errorMessage)
          );
          return;
        }
        
        // Handle upload errors
        if (errorMessage.includes('Failed to upload avatar')) {
          res.status(HTTP_statusCode.InternalServerError).json(
            new ResponseModel(false, 'Failed to upload avatar. Please try again.')
          );
          return;
        }

        // Handle multer specific errors
        if (errorMessage.includes('File too large')) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'File size exceeds the allowed limit')
          );
          return;
        }
        if (errorMessage.includes('Only image files are allowed')) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'Only image files are allowed')
          );
          return;
        }
        if (errorMessage.includes('Unexpected field')) {
          res.status(HTTP_statusCode.BadRequest).json(
            new ResponseModel(false, 'Invalid file field name')
          );
          return;
        }
      }
      
      res.status(HTTP_statusCode.InternalServerError).json(
        new ResponseModel(false, 'Internal server error')
      );
    }
  };

  getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log("Getting user profile");
      
      const userId = req.user?.id;
      
      if (!userId) {
        console.log("No user ID found in token");
        res.status(HTTP_statusCode.Unauthorized).json(
          new ResponseModel(false, 'Unauthorized: User not authenticated')
        );
        return;
      }

      console.log("Fetching profile for user ID:", userId);

      const result = await this.userService.getUserProfile(userId);

      console.log("Profile fetch result:", {
        success: !!result.user,
        hasData: !!result.user
      });

      res.status(HTTP_statusCode.OK).json(
        new ResponseModel(true, 'Profile retrieved successfully', result.user)
      );

    } catch (error) {
      console.error('Get profile controller error:', error);
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Handle not found errors
        if (errorMessage.includes('User not found')) {
          res.status(HTTP_statusCode.NotFound).json(
            new ResponseModel(false, errorMessage)
          );
          return;
        }
      }
      
      res.status(HTTP_statusCode.InternalServerError).json(
        new ResponseModel(false, 'Internal server error')
      );
    }
  };

  // Optional: Add method to handle avatar deletion specifically
  deleteAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log("Deleting user avatar");
      
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(HTTP_statusCode.Unauthorized).json(
          new ResponseModel(false, 'Unauthorized: User not authenticated')
        );
        return;
      }

      // Call service to delete avatar
      const result = await this.userService.updateProfile(userId, { avatar: null });

      res.status(HTTP_statusCode.OK).json(
        new ResponseModel(true, 'Avatar deleted successfully', result.user)
      );

    } catch (error) {
      console.error('Delete avatar controller error:', error);
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('User not found')) {
          res.status(HTTP_statusCode.NotFound).json(
            new ResponseModel(false, errorMessage)
          );
          return;
        }
      }
      
      res.status(HTTP_statusCode.InternalServerError).json(
        new ResponseModel(false, 'Internal server error')
      );
    }
  };
}

export default UserController;