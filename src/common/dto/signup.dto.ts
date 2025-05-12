import {
  IsEmail,
  IsNotEmpty,
  IsDefined,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { UserRole } from 'src/user/enums/user-role.enum';

export class SignupDto {
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
  role: UserRole;
}
