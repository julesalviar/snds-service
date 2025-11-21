import {
  IsEmail,
  IsNotEmpty,
  IsDefined,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from 'src/user/enums/user-role.enum';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  userName: string;

  @IsOptional()
  name: string;

  @IsOptional()
  address: string;

  @IsOptional()
  sector: string;

  @IsOptional()
  selectedOption: string;

  @IsNotEmpty()
  @IsOptional()
  firstName: string;

  @IsOptional()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsDefined()
  @IsEnum(UserRole)
  role: UserRole;

  @IsString({ each: true })
  @IsDefined()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];

  @IsString()
  @IsDefined()
  @IsEnum(UserRole)
  activeRole: UserRole;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['role', 'roles', 'activeRole', 'password'] as const),
) {
  @IsOptional()
  _id?: string;
}
