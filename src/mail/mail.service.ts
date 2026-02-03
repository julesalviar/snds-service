import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendEmailCommand,
  SendEmailCommandOutput,
  SESClient,
} from '@aws-sdk/client-ses';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { EncryptionService } from 'src/encryption/encryption.service';
import { ClsService } from 'nestjs-cls';
import { PROVIDER } from 'src/common/constants/providers';
import { UserInviteDocument } from 'src/user-invite/user-invite.schema';
import { InviteQueueService } from 'src/queue/invite-queue.service';
import * as crypto from 'node:crypto';

const SCHOOL_ADMIN_REGISTRATION_PATH = '/close-registration';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private sesClient = new SESClient({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
    },
  });

  constructor(
    private readonly userService: UserService,
    private readonly encryptionService: EncryptionService,
    private readonly clsService: ClsService,
    private readonly inviteQueueService: InviteQueueService,
    private readonly configService: ConfigService,
    @Inject(PROVIDER.USER_INVITE_MODEL)
    private readonly userInviteModel: Model<UserInviteDocument>,
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<SendEmailCommandOutput> {
    const tenantCode = this.clsService.get<string>('tenantCode');

    this.logger.log(`Sending email to: ${to}`, {
      to,
      subject,
      tenantCode: tenantCode || 'N/A',
    });

    const command = new SendEmailCommand({
      Source: 'no-reply@mysnds.com',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } },
      },
    });

    try {
      const result = await this.sesClient.send(command);

      this.logger.log(`Email sent successfully to: ${to}`, {
        to,
        subject,
        messageId: result.MessageId,
        tenantCode: tenantCode || 'N/A',
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to send email to: ${to}`, {
        to,
        subject,
        tenantCode: tenantCode || 'N/A',
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Build tenant-aware URL
   * For production: uses subdomain (e.g., https://dev.example.com)
   * For localhost: uses subdomain with .local (e.g., http://dev.local:4200)
   */
  private buildTenantUrl(path: string): string {
    const tenantCode = this.clsService.get<string>('tenantCode');
    const frontendUrl = process.env.FRONTEND_URL;
    const isProduction = process.env.NODE_ENV === 'production';

    if (!tenantCode) {
      return `${frontendUrl || 'http://localhost:4200'}${path}`;
    }

    // Common multi-level public suffixes in PH
    const publicSuffixesPH = new Set([
      'com.ph',
      'net.ph',
      'org.ph',
      'gov.ph',
      'edu.ph',
      'mil.ph',
    ]);

    const extractBaseDomain = (hostname: string): string => {
      const parts = hostname.split('.');
      const lastTwo = parts.slice(-2).join('.');
      const lastThree = parts.slice(-3).join('.');

      // If the last two labels form a known public suffix, keep the last three
      if (publicSuffixesPH.has(lastTwo)) {
        return lastThree;
      }
      return lastTwo;
    };

    if (isProduction) {
      if (frontendUrl) {
        try {
          const url = new URL(frontendUrl);
          const baseDomain = extractBaseDomain(url.hostname);
          const protocol = url.protocol || 'https:';
          return `${protocol}//${tenantCode}.${baseDomain}${path}`;
        } catch {
          const baseDomain = extractBaseDomain(frontendUrl);
          return `https://${tenantCode}.${baseDomain}${path}`;
        }
      }
      return `https://${tenantCode}.mysnds.com${path}`;
    } else {
      const port = frontendUrl
        ? (() => {
            try {
              const url = new URL(frontendUrl);
              return url.port || '4200';
            } catch {
              const match = frontendUrl.match(/:(\d+)/);
              return match ? match[1] : '4200';
            }
          })()
        : '4200';
      return `http://${tenantCode}.local:${port}${path}`;
    }
  }

  /**
   * Queue confirm-email for SQS delivery, or send synchronously when SQS not configured.
   * Token must already be generated and stored (caller responsibility).
   */
  async queueConfirmEmail(
    to: string,
    confirmationToken?: string,
    confirmationUrl?: string,
  ): Promise<SendEmailCommandOutput | { queued: true }> {
    const tenantCode = this.clsService.get<string>('tenantCode');
    if (!tenantCode) {
      throw new BadRequestException('Tenant context is required');
    }

    if (this.inviteQueueService.isConfigured()) {
      await this.inviteQueueService.enqueueConfirmEmail(
        to.toLowerCase(),
        tenantCode,
      );
      return { queued: true };
    }

    return this.sendConfirmEmail(to, confirmationToken, confirmationUrl);
  }

  async sendConfirmEmail(
    to: string,
    confirmationToken?: string,
    confirmationUrl?: string,
  ): Promise<SendEmailCommandOutput> {
    const subject = 'Confirm Your Email Address';
    const confirmationLink =
      confirmationUrl ||
      this.buildTenantUrl(`/confirm-email?token=${confirmationToken || ''}`);

    this.logger.log(`Sending email confirmation to: ${to}`, {
      to,
      hasToken: !!confirmationToken,
      confirmationUrl: confirmationLink,
    });

    const body = `Thank you for signing up! Please confirm your email address by clicking the link below:\n\n${confirmationLink}\n\nIf you did not create an account, please ignore this email.`;

    return await this.sendEmail(to, subject, body);
  }

  /**
   * Queue school admin registration invites. Creates UserInvite with status 'pending'
   * for each email and adds them to SQS. Consumer processes at 10 emails/sec.
   * Falls back to synchronous sendInvites when SQS is not configured.
   */
  async queueInvites(toAddresses: string[]): Promise<
    Array<{
      email: string;
      status: 'pending' | 'sent';
      sentAt: string;
      messageId?: string;
      error?: string;
    }>
  > {
    const tenantCode = this.clsService.get<string>('tenantCode');
    if (!tenantCode) {
      throw new BadRequestException('Tenant context is required for invites');
    }

    if (!this.inviteQueueService.isConfigured()) {
      this.logger.warn(
        'SQS not configured, falling back to synchronous invite sending',
      );
      const syncResults = await this.sendInvites(toAddresses);
      return syncResults.map((r) => ({
        email: r.email,
        status: 'sent' as const,
        sentAt: r.sentAt.toISOString(),
        ...(r.messageId && { messageId: r.messageId }),
        ...(r.error && { error: r.error }),
      }));
    }

    const results: Array<{ email: string; status: 'pending'; sentAt: string }> =
      [];
    const sentAt = new Date();
    const expiresAt = new Date();
    const defaultExpirationDays =
      this.configService.get<number>('DEFAULT_INVITE_EXPIRATION_DAYS') ?? 7;
    expiresAt.setDate(expiresAt.getDate() + defaultExpirationDays);

    for (const to of toAddresses) {
      const normalized = to?.trim?.()?.toLowerCase?.();
      if (!normalized) continue;

      await this.createInviteWithUniqueToken({
        email: normalized,
        sentAt,
        status: 'pending',
        processingMethod: 'sqs',
        expiresAt,
      });

      await this.inviteQueueService.enqueueInvite(normalized, tenantCode);
      results.push({
        email: normalized,
        status: 'pending',
        sentAt: sentAt.toISOString(),
      });
    }

    return results;
  }

  /**
   * Send school admin registration invites to one or more email addresses.
   * Each invite is sent and recorded; failures for one address do not stop others.
   * @deprecated Use queueInvites for rate-limited processing via SQS
   */
  async sendInvites(
    toAddresses: string[],
  ): Promise<
    Array<{ email: string; messageId?: string; sentAt: Date; error?: string }>
  > {
    const sentAt = new Date();
    const expiresAt = new Date();
    const defaultExpirationDays =
      this.configService.get<number>('DEFAULT_INVITE_EXPIRATION_DAYS') ?? 7;
    expiresAt.setDate(expiresAt.getDate() + defaultExpirationDays);

    const results: Array<{
      email: string;
      messageId?: string;
      sentAt: Date;
      error?: string;
    }> = [];

    for (const to of toAddresses) {
      const normalized = to?.trim?.()?.toLowerCase?.();
      if (!normalized) continue;

      const token = this.generateInviteToken();
      const registrationUrl = this.buildTenantUrl(
        `${SCHOOL_ADMIN_REGISTRATION_PATH}?token=${token}`,
      );
      const subject = "You're invited to register as a School Admin";
      const body = `You have been invited to register as a school admin. Click the link below to complete your registration:\n\n${registrationUrl}\n\nIf you did not expect this invite, you can ignore this email.`;

      try {
        const result = await this.sendEmail(normalized, subject, body);
        await this.createInviteWithUniqueToken(
          {
            email: normalized,
            sentAt,
            status: 'sent',
            processingMethod: 'synchronous',
            expiresAt,
          },
          token,
        );
        results.push({
          email: normalized,
          messageId: result.MessageId,
          sentAt,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Invite failed for ${normalized}: ${errorMessage}`);
        results.push({
          email: normalized,
          sentAt: new Date(),
          error: errorMessage,
        });
      }
    }

    return results;
  }

  /**
   * Queue reset-password for SQS delivery, or send synchronously when SQS not configured.
   * Token must already be generated and stored (caller responsibility).
   */
  async queueResetPasswordEmail(
    to: string,
    resetToken?: string,
    resetUrl?: string,
  ): Promise<SendEmailCommandOutput | { queued: true }> {
    const tenantCode = this.clsService.get<string>('tenantCode');
    if (!tenantCode) {
      throw new BadRequestException('Tenant context is required');
    }

    if (this.inviteQueueService.isConfigured()) {
      await this.inviteQueueService.enqueueResetPassword(
        to.toLowerCase(),
        tenantCode,
      );
      return { queued: true };
    }

    return this.sendResetPasswordEmail(to, resetToken, resetUrl);
  }

  async sendResetPasswordEmail(
    to: string,
    resetToken?: string,
    resetUrl?: string,
  ): Promise<SendEmailCommandOutput> {
    const subject = 'Reset Your Password';
    const resetLink =
      resetUrl ||
      this.buildTenantUrl(`/reset-password?token=${resetToken || ''}`);

    this.logger.log(`Sending password reset email to: ${to}`, {
      to,
      hasToken: !!resetToken,
      resetUrl: resetLink,
    });

    const body = `You requested to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you did not request a password reset, please ignore this email.`;

    return await this.sendEmail(to, subject, body);
  }

  /**
   * Generate a secure random token (16 bytes = 32 hex chars, 128-bit entropy)
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a shorter invite token (16 bytes = 32 hex chars).
   * 128-bit entropy avoids collisions; unique index on token catches any duplicate.
   */
  private generateInviteToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create invite with retry on token collision (extremely rare with 16 bytes).
   * If token provided, uses it; otherwise generates. Returns the token used.
   */
  private async createInviteWithUniqueToken(
    doc: {
      email: string;
      sentAt: Date;
      status: 'pending' | 'sent';
      processingMethod: 'sqs' | 'synchronous';
      expiresAt: Date;
    },
    token?: string,
  ): Promise<string> {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      const t = token ?? this.generateInviteToken();
      try {
        await this.userInviteModel.create({ ...doc, token: t });
        return t;
      } catch (err: unknown) {
        const isDuplicate =
          err &&
          typeof err === 'object' &&
          'code' in err &&
          (err as { code?: number }).code === 11000;
        if (isDuplicate && i < maxRetries - 1) {
          token = undefined;
          continue;
        }
        throw err;
      }
    }
    throw new Error('Failed to create invite after token retries');
  }

  /**
   * Process email confirmation - verify token and mark email as verified
   */
  async processEmailConfirmation(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userService.findByEmailConfirmationToken(token);

    if (!user) {
      throw new NotFoundException('Invalid or expired confirmation token');
    }

    if (
      user.emailConfirmationTokenExpires &&
      new Date() > user.emailConfirmationTokenExpires
    ) {
      throw new BadRequestException('Confirmation token has expired');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.userService.confirmEmail(user._id.toString());

    return {
      success: true,
      message: 'Email confirmed successfully',
    };
  }

  /**
   * Process password reset - verify token and update password
   */
  async processPasswordReset(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userService.findByPasswordResetToken(token);

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    if (
      user.passwordResetTokenExpires &&
      new Date() > user.passwordResetTokenExpires
    ) {
      throw new BadRequestException('Reset token has expired');
    }

    const hashedPassword =
      await this.encryptionService.hashPassword(newPassword);
    await this.userService.resetPassword(user._id.toString(), hashedPassword);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  /**
   * Generate and store email confirmation token for a user
   */
  async generateEmailConfirmationToken(email: string): Promise<string> {
    const user = await this.userService.getUserByUserEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiry

    await this.userService.setEmailConfirmationToken(
      user._id.toString(),
      token,
      expiresAt,
    );

    return token;
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.userService.getUserByUserEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1-hour expiry

    await this.userService.setPasswordResetToken(
      user._id.toString(),
      token,
      expiresAt,
    );

    return token;
  }

  async ensurePasswordResetToken(email: string, token: string): Promise<void> {
    await this.verifyPasswordResetToken(email, token);

    const user = await this.userService.getUserByUserEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1-hour expiry

    await this.userService.setPasswordResetToken(
      user._id.toString(),
      token,
      expiresAt,
    );
  }

  /**
   * Verify that a password reset token is valid and belongs to the user
   * Returns true if token is valid, false if the token doesn't exist (new token), throws error if invalid
   */
  async verifyPasswordResetToken(
    email: string,
    token: string,
  ): Promise<{ valid: boolean; isNew: boolean; message?: string }> {
    const user = await this.userService.getUserByUserEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tokenUser = await this.userService.findByPasswordResetToken(token);

    if (!tokenUser) {
      return { valid: true, isNew: true };
    }

    if (tokenUser.email.toLowerCase() !== email.toLowerCase()) {
      throw new BadRequestException(
        'Invalid reset token. The token does not belong to this email address.',
      );
    }

    if (
      tokenUser.passwordResetTokenExpires &&
      new Date() > tokenUser.passwordResetTokenExpires
    ) {
      throw new BadRequestException('Reset token has expired');
    }

    return { valid: true, isNew: false };
  }

  /**
   * Verify that an email confirmation token is valid and belongs to the user
   * Returns true if the token is valid, false if the token doesn't exist (new token), throws error if invalid
   */
  async verifyEmailConfirmationToken(
    email: string,
    token: string,
  ): Promise<{ valid: boolean; isNew: boolean; message?: string }> {
    const user = await this.userService.getUserByUserEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find user by token
    const tokenUser =
      await this.userService.findByEmailConfirmationToken(token);

    // If a token doesn't exist, it's a new token - allow it
    if (!tokenUser) {
      return { valid: true, isNew: true };
    }

    // Token exists - verify it belongs to the user with the provided email
    if (tokenUser.email.toLowerCase() !== email.toLowerCase()) {
      throw new BadRequestException(
        'Invalid confirmation token. The token does not belong to this email address.',
      );
    }

    if (
      tokenUser.emailConfirmationTokenExpires &&
      new Date() > tokenUser.emailConfirmationTokenExpires
    ) {
      throw new BadRequestException('Confirmation token has expired');
    }

    if (tokenUser.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    return { valid: true, isNew: false };
  }

  async ensureEmailConfirmationToken(
    email: string,
    token: string,
  ): Promise<void> {
    await this.verifyEmailConfirmationToken(email, token);

    const user = await this.userService.getUserByUserEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24 * 2); // 48-hour expiry

    await this.userService.setEmailConfirmationToken(
      user._id.toString(),
      token,
      expiresAt,
    );
  }
}
