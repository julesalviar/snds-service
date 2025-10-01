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
import { PartialType } from '@nestjs/mapped-types';

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
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  _id?: string;
}
