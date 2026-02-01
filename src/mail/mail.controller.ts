import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import {
  ConfirmEmailDto,
  ResetPasswordEmailDto,
  ProcessEmailConfirmationDto,
  ProcessPasswordResetDto,
  SendInviteRequestDto,
  SendInviteResponseDto,
} from './mail.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('invite')
  @HttpCode(HttpStatus.OK)
  async sendInvite(
    @Body() dto: SendInviteRequestDto,
  ): Promise<SendInviteResponseDto> {
    const addresses = dto.emails
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (addresses.length === 0) {
      return {
        message: 'No valid email address provided',
        results: [],
      };
    }

    if (addresses.length === 1) {
      const result = await this.mailService.sendInvite(addresses[0]);
      return {
        message: 'Invite sent successfully',
        messageId: result.messageId,
        sentAt: result.sentAt.toISOString(),
        results: [
          {
            email: addresses[0],
            messageId: result.messageId,
            sentAt: result.sentAt.toISOString(),
          },
        ],
      };
    }

    const results = await this.mailService.sendInvites(addresses);
    return {
      message: 'Invites processed',
      results: results.map((r) => ({
        email: r.email,
        messageId: r.messageId,
        sentAt: r.sentAt.toISOString(),
        ...(r.error && { error: r.error }),
      })),
    };
  }

  @Public()
  @Post('confirm-email')
  @HttpCode(HttpStatus.OK)
  async sendConfirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    // Generate and store token if not provided
    let token = confirmEmailDto.confirmationToken;
    if (!token) {
      token = await this.mailService.generateEmailConfirmationToken(
        confirmEmailDto.to,
      );
    } else {
      // If token is provided, ensure it's stored in the database
      await this.mailService.ensureEmailConfirmationToken(
        confirmEmailDto.to,
        token,
      );
    }

    return await this.mailService.sendConfirmEmail(
      confirmEmailDto.to,
      token,
      confirmEmailDto.confirmationUrl,
    );
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async sendResetPasswordEmail(
    @Body() resetPasswordEmailDto: ResetPasswordEmailDto,
  ) {
    let token = resetPasswordEmailDto.resetToken;
    if (!token) {
      token = await this.mailService.generatePasswordResetToken(
        resetPasswordEmailDto.to,
      );
    } else {
      await this.mailService.ensurePasswordResetToken(
        resetPasswordEmailDto.to,
        token,
      );
    }

    return await this.mailService.sendResetPasswordEmail(
      resetPasswordEmailDto.to,
      token,
      resetPasswordEmailDto.resetUrl,
    );
  }

  @Public()
  @Post('confirm-email/verify')
  @HttpCode(HttpStatus.OK)
  async processEmailConfirmation(
    @Body() processEmailConfirmationDto: ProcessEmailConfirmationDto,
  ) {
    return await this.mailService.processEmailConfirmation(
      processEmailConfirmationDto.token,
    );
  }

  @Public()
  @Post('reset-password/verify')
  @HttpCode(HttpStatus.OK)
  async processPasswordReset(
    @Body() processPasswordResetDto: ProcessPasswordResetDto,
  ) {
    return await this.mailService.processPasswordReset(
      processPasswordResetDto.token,
      processPasswordResetDto.newPassword,
    );
  }
}
