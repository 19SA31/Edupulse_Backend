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
      avatar:user.avatar,
      createdAt: user.createdAt.toISOString(),
      isBlocked: user.isBlocked,
    };
  }

  static toDtoArray(users: User[]): UserDto[] {
    return users.map((user) => this.toDto(user));
  }

  
  static toPaginatedDto(
    users: UserDto[], 
    totalPages: number,
    currentPage: number,
    totalCount: number
  ): PaginatedUsersDto {
    return {
      users: users, 
      totalPages,
      currentPage,
      totalCount,
    };
  }

  
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