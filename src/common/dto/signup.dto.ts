import {
  IsEmail,
  IsNotEmpty,
  IsDefined,
  IsString,
  MinLength,
} from 'class-validator';

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

  @IsDefined()
  @IsNotEmpty()
  firstName: string;

  @IsDefined()
  @IsNotEmpty()
  lastName: string;
}
