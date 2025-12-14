import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
} from 'class-validator';

export class ConfirmEmailDto {
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsOptional()
  @IsString()
  confirmationToken?: string;

  @IsOptional()
  @IsString()
  confirmationUrl?: string;
}

export class ResetPasswordEmailDto {
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsOptional()
  @IsString()
  resetToken?: string;

  @IsOptional()
  @IsString()
  resetUrl?: string;
}

export class ProcessEmailConfirmationDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class ProcessPasswordResetDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
