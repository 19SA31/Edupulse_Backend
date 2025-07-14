// src/dtos/admin/UserDto.ts
export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar:string | null;
  createdAt: string;
  isBlocked: boolean;
}

export interface PaginatedUsersDto {
  users: UserDto[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}