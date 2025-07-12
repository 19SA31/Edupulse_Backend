// src/mappers/admin/UserMapper.ts
import { User } from "../../interfaces/adminInterface/adminInterface";
import { UserDto, PaginatedUsersDto } from "../../dto/admin/UserDTO";

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      isBlocked: user.isBlocked,
    };
  }

  static toDtoArray(users: User[]): UserDto[] {
    return users.map((user) => this.toDto(user));
  }

  // Updated method to accept UserDto[] instead of User[]
  static toPaginatedDto(
    users: UserDto[], // Changed from User[] to UserDto[]
    totalPages: number,
    currentPage: number,
    totalCount: number
  ): PaginatedUsersDto {
    return {
      users: users, // No need to transform since they're already DTOs
      totalPages,
      currentPage,
      totalCount,
    };
  }

  // Keep the original method for when you have full entities
  static toPaginatedDtoFromEntities(
    users: User[],
    totalPages: number,
    currentPage: number,
    totalCount: number
  ): PaginatedUsersDto {
    return {
      users: this.toDtoArray(users),
      totalPages,
      currentPage,
      totalCount,
    };
  }
}