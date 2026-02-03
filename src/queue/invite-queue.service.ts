import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Model } from 'mongoose';
import { UserInvite, UserInviteSchema } from 'src/user-invite/user-invite.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { TenantConnectionResolverService } from 'src/providers/tenant-connection/tenant-connection-resolver.service';

const SCHOOL_ADMIN_REGISTRATION_PATH = '/close-registration';
const CONFIRM_EMAIL_PATH = '/confirm-email';
const RESET_PASSWORD_PATH = '/reset-password';
const EMAILS_PER_SECOND = 10;
const POLL_INTERVAL_MS = 1000;

export type MailQueueMessageType =
  | 'invite'
  | 'confirm-email'
  | 'reset-password';

export interface InviteQueueMessage {
  type: MailQueueMessageType;
  email: string;
  tenantCode: string;
}

@Injectable()
export class InviteQueueService implements OnModuleInit {
  private readonly logger = new Logger(InviteQueueService.name);
  private sqsClient: SQSClient;
  private sesClient: SESClient;
  private queueUrl: string;
  private isPolling = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly tenantConnectionResolver: TenantConnectionResolverService,
  ) {
    const region =
      this.configService.get<string>('AWS_REGION') ?? 'ap-southeast-1';
    const credentials = {
      accessKeyId: this.configService.get<string>('AWS_SES_ACCESS_KEY_ID')!,
      secretAccessKey: this.configService.get<string>(
        'AWS_SES_SECRET_ACCESS_KEY',
      )!,
    };

    this.sqsClient = new SQSClient({ region, credentials });
    this.sesClient = new SESClient({ region, credentials });
    this.queueUrl =
      this.configService.get<string>('AWS_SQS_INVITE_QUEUE_URL') ?? '';
  }

  isConfigured(): boolean {
    return !!this.queueUrl?.trim();
  }

  private async enqueue(
    type: MailQueueMessageType,
    email: string,
    tenantCode: string,
  ): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn(
        'AWS_SQS_INVITE_QUEUE_URL not configured, skipping enqueue',
      );
      return;
    }

    const message: InviteQueueMessage = { type, email, tenantCode };
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
    });

    await this.sqsClient.send(command);
    this.logger.debug(`Enqueued ${type} for ${email} (tenant: ${tenantCode})`);
  }

  async enqueueInvite(email: string, tenantCode: string): Promise<void> {
    await this.enqueue('invite', email, tenantCode);
  }

  async enqueueInvites(emails: string[], tenantCode: string): Promise<void> {
    for (const email of emails) {
      await this.enqueueInvite(email, tenantCode);
    }
  }

  async enqueueConfirmEmail(email: string, tenantCode: string): Promise<void> {
    await this.enqueue('confirm-email', email, tenantCode);
  }

  async enqueueResetPassword(email: string, tenantCode: string): Promise<void> {
    await this.enqueue('reset-password', email, tenantCode);
  }

  onModuleInit() {
    if (this.queueUrl) {
      this.startConsumer();
    } else {
      this.logger.warn(
        'AWS_SQS_INVITE_QUEUE_URL not set, invite queue consumer disabled',
      );
    }
  }

  private startConsumer() {
    if (this.isPolling) return;
    this.isPolling = true;
    this.logger.log('Starting invite queue consumer (10 emails/sec)');
    this.poll();
  }

  private async poll() {
    while (this.isPolling) {
      try {
        await this.processBatch();
      } catch (err) {
        this.logger.error('Invite queue poll error', err);
      }
      await this.sleep(POLL_INTERVAL_MS);
    }
  }

  private async processBatch() {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: EMAILS_PER_SECOND,
      WaitTimeSeconds: 1,
    });

    const response = await this.sqsClient.send(command);
    const messages = response.Messages ?? [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.Body || !msg.ReceiptHandle) continue;

      try {
        const body = JSON.parse(msg.Body) as InviteQueueMessage;
        const type = body.type ?? 'invite';
        if (type === 'invite') {
          await this.processInvite(body.email, body.tenantCode);
        } else if (type === 'confirm-email') {
          await this.processConfirmEmail(body.email, body.tenantCode);
        } else if (type === 'reset-password') {
          await this.processResetPassword(body.email, body.tenantCode);
        } else {
          this.logger.warn(`Unknown mail type: ${type}`);
        }
        await this.deleteMessage(msg.ReceiptHandle);
      } catch (err) {
        this.logger.error(`Failed to process invite message: ${msg.Body}`, err);
        // Don't delete - message will return to queue after visibility timeout
      }

      // Rate limit: 10 emails/sec = 100ms between each
      if (i < messages.length - 1) {
        await this.sleep(1000 / EMAILS_PER_SECOND);
      }
    }
  }

  private async deleteMessage(receiptHandle: string) {
    await this.sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
  }

  private async processInvite(
    email: string,
    tenantCode: string,
  ): Promise<void> {
    const tenantConnection =
      this.tenantConnectionResolver.getConnectionForTenant(tenantCode);
    const userInviteModel = tenantConnection.model(
      UserInvite.name,
      UserInviteSchema,
    ) as Model<UserInvite>;

    const invite = await userInviteModel
      .findOne({ email: email.toLowerCase(), status: 'pending' })
      .exec();
    if (!invite) {
      this.logger.warn(
        `No pending invite found for ${email} (tenant: ${tenantCode})`,
      );
      return;
    }

    const token = (invite as any).token;
    const path = token
      ? `${SCHOOL_ADMIN_REGISTRATION_PATH}?token=${token}`
      : SCHOOL_ADMIN_REGISTRATION_PATH;
    const registrationUrl = this.buildTenantUrlWithPath(tenantCode, path);
    const subject = "You're invited to register as a School Admin";
    const body = `You have been invited to register as a school admin. Click the link below to complete your registration:\n\n${registrationUrl}\n\nIf you did not expect this invite, you can ignore this email.`;

    const sendCommand = new SendEmailCommand({
      Source: 'no-reply@mysnds.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } },
      },
    });

    try {
      await this.sesClient.send(sendCommand);
      const sentAt = new Date();
      await userInviteModel.updateOne(
        { _id: invite._id },
        { $set: { status: 'sent', sentAt } },
      );
      this.logger.log(`Invite sent to ${email} (tenant: ${tenantCode})`);
    } catch (err) {
      this.logger.error(`Failed to send invite to ${email}`, err);
      throw err;
    }
  }

  private async processConfirmEmail(
    email: string,
    tenantCode: string,
  ): Promise<void> {
    const tenantConnection =
      this.tenantConnectionResolver.getConnectionForTenant(tenantCode);
    const userModel = tenantConnection.model(
      User.name,
      UserSchema,
    ) as Model<User>;

    const user = await userModel
      .findOne({ email: email.toLowerCase() })
      .select(
        'emailConfirmationToken emailConfirmationTokenExpires emailVerified',
      )
      .lean()
      .exec();

    if (!user) {
      this.logger.warn(`User not found for confirm-email: ${email}`);
      return;
    }

    const token = (user as any).emailConfirmationToken;
    if (!token) {
      this.logger.warn(`No confirmation token for ${email}`);
      return;
    }

    const expiresAt = (user as any).emailConfirmationTokenExpires;
    if (expiresAt && new Date() > new Date(expiresAt)) {
      this.logger.warn(`Confirmation token expired for ${email}`);
      return;
    }

    const confirmationUrl = this.buildTenantUrlWithPath(
      tenantCode,
      `${CONFIRM_EMAIL_PATH}?token=${token}`,
    );
    const subject = 'Confirm Your Email Address';
    const body = `Thank you for signing up! Please confirm your email address by clicking the link below:\n\n${confirmationUrl}\n\nIf you did not create an account, please ignore this email.`;

    await this.sendEmail(email, subject, body);
    this.logger.log(`Confirm email sent to ${email} (tenant: ${tenantCode})`);
  }

  private async processResetPassword(
    email: string,
    tenantCode: string,
  ): Promise<void> {
    const tenantConnection =
      this.tenantConnectionResolver.getConnectionForTenant(tenantCode);
    const userModel = tenantConnection.model(
      User.name,
      UserSchema,
    ) as Model<User>;

    const user = await userModel
      .findOne({ email: email.toLowerCase() })
      .select('passwordResetToken passwordResetTokenExpires')
      .lean()
      .exec();

    if (!user) {
      this.logger.warn(`User not found for reset-password: ${email}`);
      return;
    }

    const token = (user as any).passwordResetToken;
    if (!token) {
      this.logger.warn(`No reset token for ${email}`);
      return;
    }

    const expiresAt = (user as any).passwordResetTokenExpires;
    if (expiresAt && new Date() > new Date(expiresAt)) {
      this.logger.warn(`Reset token expired for ${email}`);
      return;
    }

    const resetUrl = this.buildTenantUrlWithPath(
      tenantCode,
      `${RESET_PASSWORD_PATH}?token=${token}`,
    );
    const subject = 'Reset Your Password';
    const body = `You requested to reset your password. Click the link below to reset it:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you did not request a password reset, please ignore this email.`;

    await this.sendEmail(email, subject, body);
    this.logger.log(
      `Reset password email sent to ${email} (tenant: ${tenantCode})`,
    );
  }

  private async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<void> {
    const command = new SendEmailCommand({
      Source: 'no-reply@mysnds.com',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } },
      },
    });
    await this.sesClient.send(command);
  }

  private buildTenantUrlWithPath(tenantCode: string, path: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const isProduction = process.env.NODE_ENV === 'production';

    if (!tenantCode) {
      return `${frontendUrl || 'http://localhost:4200'}${path}`;
    }

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
    }

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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
