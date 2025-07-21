// /src/mapper/user/UserMapper.ts
import { 
  UpdateProfileRequestDTO, 
  UpdateProfileDTO, 
  UserProfileResponseDTO, 
  UserDatabaseDTO,
  UpdateUserDatabaseDTO,
  CreateUserRequestDTO,
  ValidationErrorDTO,
  UserSummaryDTO
  
} from '../../dto/user/UserDTO';
import { 
  IUser, 
  UpdateProfileData, 
  UserProfileData, 
  CreateUserType,
  CropData
} from '../../interfaces/userInterface/userInterface';

export interface IUserMapper {
  
  mapUpdateProfileRequest(requestData: UpdateProfileRequestDTO): UpdateProfileDTO;
  mapUpdateProfileToServiceData(dto: UpdateProfileDTO): UpdateProfileData;
  mapCreateUserRequest(requestData: CreateUserRequestDTO): CreateUserType;
  
  
  mapDatabaseUserToResponse(user: IUser, avatarUrl?: string | null): UserProfileResponseDTO;
  mapUserProfileDataToResponse(userData: UserProfileData): UserProfileResponseDTO;
  
  
  mapUpdateDTOToDatabase(dto: UpdateProfileDTO): UpdateUserDatabaseDTO;
  mapDatabaseUserToProfileData(user: IUser): UserProfileData;
  
  
  mapValidationErrors(errors: string[]): ValidationErrorDTO[];
  
 
  parseCropData(cropDataString: string): CropData | null;
  formatDateToISO(date: Date | undefined): string | undefined;
}

export class UserMapper implements IUserMapper {
  
  
  mapUpdateProfileRequest(requestData: UpdateProfileRequestDTO): UpdateProfileDTO {
    const mappedData: UpdateProfileDTO = {};
    
    if (requestData.name !== undefined) {
      mappedData.name = requestData.name?.trim();
    }
    
    if (requestData.phone !== undefined) {
      mappedData.phone = requestData.phone?.trim();
    }
    
    if (requestData.DOB !== undefined) {
      mappedData.DOB = requestData.DOB;
    }
    
    if (requestData.gender !== undefined) {
      mappedData.gender = requestData.gender;
    }
    
    if (requestData.avatar !== undefined) {
      mappedData.avatar = requestData.avatar;
    }
    
    
    if (requestData.cropData) {
      mappedData.cropData = this.parseCropData(requestData.cropData);
    }
    
    return mappedData;
  }

  
  mapUpdateProfileToServiceData(dto: UpdateProfileDTO): UpdateProfileData {
    const serviceData: UpdateProfileData = {};
    
    if (dto.name !== undefined) {
      serviceData.name = dto.name;
    }
    
    if (dto.phone !== undefined) {
      serviceData.phone = dto.phone;
    }
    
    if (dto.DOB !== undefined) {
      serviceData.DOB = dto.DOB;
    }
    
    if (dto.gender !== undefined) {
      serviceData.gender = dto.gender;
    }
    
    if (dto.avatar !== undefined) {
      serviceData.avatar = dto.avatar;
    }
    
    if (dto.cropData !== undefined) {
      serviceData.cropData = dto.cropData;
    }
    
    return serviceData;
  }

  
  mapCreateUserRequest(requestData: CreateUserRequestDTO): CreateUserType {
    return {
      name: requestData.name.trim(),
      email: requestData.email.toLowerCase().trim(),
      phone: requestData.phone.replace(/\D/g, ''),
      password: requestData.password,
      createdAt: new Date()
    };
  }

  
  mapDatabaseUserToResponse(user: IUser, avatarUrl?: string | null): UserProfileResponseDTO {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      DOB: this.formatDateToISO(user.DOB),
      gender: user.gender,
      avatar: avatarUrl || null,
      isBlocked: user.isBlocked,
      createdAt: this.formatDateToISO(user.createdAt),
      updatedAt: this.formatDateToISO(user.updatedAt),
      lastLogin: this.formatDateToISO(user.lastLogin)
    };
  }

  
  mapUserProfileDataToResponse(userData: UserProfileData): UserProfileResponseDTO {
    return {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      DOB: userData.DOB ? userData.DOB.toISOString() : undefined,
      gender: userData.gender,
      avatar: userData.avatar,
      isBlocked: userData.isBlocked,
      createdAt: userData.createdAt ? userData.createdAt.toISOString() : undefined,
      updatedAt: userData.updatedAt ? userData.updatedAt.toISOString() : undefined,
      lastLogin: userData.lastLogin ? userData.lastLogin.toISOString() : undefined
    };
  }

  
  mapUpdateDTOToDatabase(dto: UpdateProfileDTO): UpdateUserDatabaseDTO {
    const databaseData: UpdateUserDatabaseDTO = {};
    
    if (dto.name !== undefined) {
      databaseData.name = dto.name;
    }
    
    if (dto.phone !== undefined) {
      databaseData.phone = dto.phone;
    }
    
    if (dto.DOB !== undefined) {
      databaseData.DOB = dto.DOB ? new Date(dto.DOB) : undefined;
    }
    
    if (dto.gender !== undefined) {
      databaseData.gender = dto.gender;
    }
    
    if (dto.avatar !== undefined) {
      
      if (typeof dto.avatar === 'string' || dto.avatar === null) {
        databaseData.avatar = dto.avatar;
      }
      
    }
    
    return databaseData;
  }

  
  mapDatabaseUserToProfileData(user: IUser): UserProfileData {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      DOB: user.DOB,
      gender: user.gender,
      avatar: user.avatar || null,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin
    };
  }

  
  mapValidationErrors(errors: string[]): ValidationErrorDTO[] {
    return errors.map(error => {
      
      const fieldMatch = error.match(/^(\w+):/);
      const field = fieldMatch ? fieldMatch[1] : 'general';
      const message = fieldMatch ? error.substring(fieldMatch[0].length).trim() : error;
      
      return {
        field,
        message
      };
    });
  }

  
  parseCropData(cropDataString: string): CropData | null {
    try {
      const parsed = JSON.parse(cropDataString);
      
      if (parsed && typeof parsed === 'object') {
        const { x, y, width, height } = parsed;
        
        if (typeof x === 'number' && typeof y === 'number' && 
            typeof width === 'number' && typeof height === 'number') {
          return { x, y, width, height };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing crop data:', error);
      return null;
    }
  }

  
  formatDateToISO(date: Date | undefined): string | undefined {
    return date ? date.toISOString() : undefined;
  }

  
  mapUsersToSummary(users: IUser[]): UserSummaryDTO[] {
    return users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || null
    }));
  }

  
  mapServiceResponseToControllerResponse(serviceData: { user: UserProfileData }): {
    user: UserProfileResponseDTO;
  } {
    return {
      user: this.mapUserProfileDataToResponse(serviceData.user)
    };
  }

  
  mapAndValidatePhone(phone: string): string {
    
    const cleanPhone = phone.replace(/\D/g, '');
    
  
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new Error('Phone number must be between 10 and 15 digits');
    }
    
    return cleanPhone;
  }

  
  mapAndValidateEmail(email: string): string {
    const cleanEmail = email.toLowerCase().trim();
    
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Invalid email format');
    }
    
    return cleanEmail;
  }

  
  mapAndValidateName(name: string): string {
    const cleanName = name.trim();
    
    if (cleanName.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    if (cleanName.length > 50) {
      throw new Error('Name must be less than 50 characters long');
    }
    
    return cleanName;
  }
}


export const userMapper = new UserMapper();


export default IUserMapper;