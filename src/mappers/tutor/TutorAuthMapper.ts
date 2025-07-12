// /src/mappers/tutor/TutorAuthMapper.ts

import { GetTutorData } from "../../interfaces/tutorInterface/tutorInterface";
import {
  SendOtpRequestDTO,
  SendOtpResponseDTO,
  VerifyOtpRequestDTO,
  VerifyOtpResponseDTO,
  TutorLoginRequestDTO,
  TutorLoginResponseDTO,
  TutorDataDTO,
  ResetPasswordRequestDTO,
  ResetPasswordResponseDTO,
  LogoutResponseDTO,
  SignUpServiceDTO,
  OtpCheckServiceDTO,
  LoginServiceDTO,
  LoginServiceResponseDTO,
  ResetPasswordServiceDTO,
} from "../../dto/tutor/TutorAuthDTO";

export class TutorAuthMapper {
  // Request mappers - Controller to Service
  static mapSendOtpRequestToService(dto: SendOtpRequestDTO): SignUpServiceDTO {
    return {
      email: dto.email,
      phone: dto.phone,
      isForgot: dto.isForgot,
    };
  }

  static mapVerifyOtpRequestToService(dto: VerifyOtpRequestDTO): OtpCheckServiceDTO {
    return {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
      otp: dto.otp,
      isForgot: dto.isForgot,
    };
  }

  static mapLoginRequestToService(dto: TutorLoginRequestDTO): LoginServiceDTO {
    return {
      email: dto.email,
      password: dto.password,
    };
  }

  static mapResetPasswordRequestToService(dto: ResetPasswordRequestDTO): ResetPasswordServiceDTO {
    return {
      email: dto.email,
      password: dto.password,
    };
  }

  // Response mappers - Service to Controller
  static mapSendOtpResponse(success: boolean, message: string): SendOtpResponseDTO {
    return {
      success,
      message,
    };
  }

  static mapVerifyOtpResponse(success: boolean, message: string): VerifyOtpResponseDTO {
    return {
      success,
      message,
    };
  }

  static mapTutorDataFromService(tutorData: GetTutorData): TutorDataDTO {
    return {
      id: tutorData.id,
      name: tutorData.name,
      email: tutorData.email,
      isVerified: tutorData.isVerified,
      verificationStatus:tutorData.verificationStatus
    };
  }

  static mapLoginServiceResponse(
    accessToken: string,
    refreshToken: string,
    tutor: GetTutorData
  ): LoginServiceResponseDTO {
    return {
      accessToken,
      refreshToken,
      tutor: this.mapTutorDataFromService(tutor),
    };
  }

  static mapTutorLoginResponse(
    success: boolean,
    message: string,
    serviceResponse: LoginServiceResponseDTO
  ): TutorLoginResponseDTO {
    return {
      success,
      message,
      data: {
        accessToken: serviceResponse.accessToken,
        refreshToken: serviceResponse.refreshToken,
        tutor: serviceResponse.tutor,
      },
    };
  }

  static mapResetPasswordResponse(success: boolean, message: string): ResetPasswordResponseDTO {
    return {
      success,
      message,
    };
  }

  static mapLogoutResponse(success: boolean, message: string): LogoutResponseDTO {
    return {
      success,
      message,
    };
  }

  // Error response mappers
  static mapErrorResponse(success: boolean, message: string): {
    success: boolean;
    message: string;
  } {
    return {
      success,
      message,
    };
  }
}