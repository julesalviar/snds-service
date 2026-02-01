import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListUserInvitesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  email?: string;
}

export class UserInviteItemDto {
  _id: string;
  email: string;
  sentAt: string;
  status: 'sent' | 'accepted';
  createdAt?: string;
  updatedAt?: string;
}

export class ListUserInvitesMetaDto {
  count: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export class ListUserInvitesResponseDto {
  data: UserInviteItemDto[];
  meta: ListUserInvitesMetaDto;
}
