import {
  SignUpRequestDto,
  SignUpResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  LoginServiceResultDto,
  LogoutResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  UserExistenceDto,
  UserProfileResponseDto
} from "../../dto/user/UserAuthDTO";

export class AuthMapper {
  
  static mapToSignUpRequest(reqBody: any): SignUpRequestDto {
    return {
      name: reqBody.name,
      email: reqBody.email,
      phone: reqBody.phone,
      password: reqBody.password,
      isForgot: reqBody.isForgot || false,
    };
  }

  static mapToVerifyOtpRequest(reqBody: any): VerifyOtpRequestDto {
    return {
      name: reqBody.name,
      email: reqBody.email,
      phone: reqBody.phone,
      password: reqBody.password,
      otp: reqBody.otp,
      isForgot: reqBody.isForgot || false,
    };
  }

  static mapToLoginRequest(reqBody: any): LoginRequestDto {
    return {
      email: reqBody.email,
      password: reqBody.password,
    };
  }

  static mapToResetPasswordRequest(reqBody: any): ResetPasswordRequestDto {
    return {
      email: reqBody.email,
      password: reqBody.password,
    };
  }

  
  static mapToSignUpResponse(
    success: boolean,
    message: string
  ): SignUpResponseDto {
    return {
      success,
      message,
    };
  }

  static mapToVerifyOtpResponse(
    success: boolean,
    message: string
  ): VerifyOtpResponseDto {
    return {
      success,
      message,
    };
  }

  static mapToLoginResponse(
    success: boolean,
    message: string,
    data?: LoginServiceResultDto
  ): LoginResponseDto {
    return {
      success,
      message,
      data: data
        ? {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          }
        : undefined,
    };
  }

  static mapToResetPasswordResponse(
    success: boolean,
    message: string
  ): ResetPasswordResponseDto {
    return {
      success,
      message,
    };
  }

  static mapToLogoutResponse(
    success: boolean,
    message: string
  ): LogoutResponseDto {
    return {
      success,
      message,
    };
  }

  
  static mapToUserProfileResponse(user: any): UserProfileResponseDto {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      DOB: user.DOB,
      gender: user.gender,
      avatar: user.avatar,
    };
  }

  static mapToLoginServiceResult(
    accessToken: string,
    refreshToken: string,
    user: any
  ): LoginServiceResultDto {
    return {
      accessToken,
      refreshToken,
      user: this.mapToUserProfileResponse(user),
    };
  }

  static mapToUserExistence(
    existEmail: boolean,
    existPhone: boolean
  ): UserExistenceDto {
    return {
      existEmail,
      existPhone,
    };
  }
}
