import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyTokenQueryDto {
  @IsNotEmpty({ message: 'token is required' })
  @IsString()
  token: string;
}

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
  status: 'pending' | 'sent' | 'accepted';
  processingMethod: 'sqs' | 'synchronous';
  token?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class CreateRegistrationTokenBodyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(365)
  expiresInDays?: number;
}

export class ExtendExpiryBodyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(365)
  extendByDays?: number = 7;
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
