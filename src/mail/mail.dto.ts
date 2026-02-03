import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  IsArray,
  ArrayMinSize,
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

export class SendInviteRequestDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'emails must contain at least one address' })
  @IsEmail({}, { each: true })
  emails: string[];
}

export class SendInviteResponseDto {
  message: string;
  messageId?: string;
  sentAt?: string;
  results?: Array<{
    email: string;
    status?: 'pending' | 'sent';
    messageId?: string;
    sentAt: string;
    error?: string;
  }>;
}
