import {
  AdminLoginRequestDTO,
  AdminLoginResponseDTO,
  AdminLogoutResponseDTO,
  AdminDomain,
  AdminLoginServiceResultDTO,
} from "../../dto/admin/AdminAuthDTO";

export class AdminAuthMapper {
  
  static mapLoginRequestToService(dto: AdminLoginRequestDTO): {
    email: string;
    password: string;
  } {
    return {
      email: dto.email?.trim()?.toLowerCase(),
      password: dto.password,
    };
  }

  
  static mapModelToDomain(model: any): AdminDomain {
    return {
      _id: model._id?.toString(),
      email: model.email,
      password: model.password,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  
  static mapServiceResultToResponse(
    serviceResult: AdminLoginServiceResultDTO,
    success: boolean = true
  ): AdminLoginResponseDTO {
    if (!serviceResult.isValid) {
      return {
        message: serviceResult.error || "Login failed",
      };
    }

    return {
      message: "Admin logged in successfully",
      accessToken: serviceResult.accessToken,
      refreshToken: serviceResult.refreshToken,
      admin: serviceResult.admin
        ? {
            id: serviceResult.admin._id,
            email: serviceResult.admin.email,
            role: "admin",
          }
        : undefined,
    };
  }

  
  static mapLogoutResponse(): AdminLogoutResponseDTO {
    return {
      message: "You have been logged out successfully",
    };
  }

  
  static sanitizeAdminData(admin: AdminDomain): Omit<AdminDomain, "password"> {
    const { password, ...sanitized } = admin;
    return sanitized;
  }
}
