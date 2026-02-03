import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as crypto from 'node:crypto';
import { PROVIDER } from 'src/common/constants/providers';
import { UserInviteDocument } from './user-invite.schema';
import { RegistrationTokenDocument } from './registration-token.schema';

export interface UserInviteListItem {
  _id: unknown;
  email: string;
  sentAt: Date;
  status: 'pending' | 'sent' | 'accepted';
  processingMethod: 'sqs' | 'synchronous';
  token?: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ListUserInvitesResult {
  data: UserInviteListItem[];
  meta: {
    count: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

@Injectable()
export class UserInviteService {
  private readonly logger = new Logger(UserInviteService.name);

  constructor(
    @Inject(PROVIDER.USER_INVITE_MODEL)
    private readonly userInviteModel: Model<UserInviteDocument>,
    @Inject(PROVIDER.REGISTRATION_TOKEN_MODEL)
    private readonly registrationTokenModel: Model<RegistrationTokenDocument>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    email?: string,
  ): Promise<ListUserInvitesResult> {
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(Math.max(1, limit), 100);

    const filter: Record<string, unknown> = {};
    if (email?.trim()) {
      filter.email = { $regex: email.trim(), $options: 'i' };
    }

    const [data, totalItems] = await Promise.all([
      this.userInviteModel
        .find(filter)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(maxLimit)
        .lean()
        .exec(),
      this.userInviteModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / maxLimit) || 1;

    this.logger.log(`List user invites: page=${page}, limit=${maxLimit}, total=${totalItems}, email=${email ?? 'all'}`);

    return {
      data: data as UserInviteListItem[],
      meta: {
        count: data.length,
        totalItems,
        currentPage: page,
        totalPages,
      },
    };
  }

  async extendExpiry(
    id: string,
    extendByDays: number = 7,
  ): Promise<{ expiresAt: Date }> {
    const invite = await this.userInviteModel.findById(id).exec();
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.status === 'accepted') {
      throw new BadRequestException('Cannot extend expiry for accepted invite');
    }

    const currentExpiry =
      invite.expiresAt instanceof Date ? invite.expiresAt : new Date(invite.expiresAt);
    const newExpiresAt = new Date(currentExpiry);
    newExpiresAt.setDate(newExpiresAt.getDate() + extendByDays);

    await this.userInviteModel
      .updateOne({ _id: id }, { $set: { expiresAt: newExpiresAt } })
      .exec();

    this.logger.log(
      `Extended invite expiry: id=${id}, newExpiresAt=${newExpiresAt.toISOString()}`,
    );

    return { expiresAt: newExpiresAt };
  }

  /**
   * Shared validation for registration tokens.
   * Both invite tokens (UserInvite) and registration tokens (RegistrationToken) use this
   * on the same registration screen.
   */
  private isTokenValid(
    expiresAt: Date | null | undefined,
    status?: string,
  ): boolean {
    if (status === 'accepted') return false;
    const expiryDate = expiresAt ? new Date(expiresAt) : null;
    if (expiryDate && new Date() > expiryDate) return false;
    return true;
  }

  /**
   * Verify token is valid for registration.
   * Shared validation for both: (1) UserInvite tokens (invite flow),
   * (2) RegistrationToken (closed registration without invite).
   * Returns only valid/invalid - no extra details.
   */
  async verifyToken(token: string): Promise<{ valid: boolean }> {
    if (!token?.trim()) return { valid: false };

    const trimmed = token.trim();

    const invite = await this.userInviteModel
      .findOne({ token: trimmed })
      .lean()
      .exec();
    if (invite) {
      return {
        valid: this.isTokenValid(
          (invite as any).expiresAt,
          (invite as any).status,
        ),
      };
    }

    const regToken = await this.registrationTokenModel
      .findOne({ token: trimmed })
      .lean()
      .exec();
    if (regToken) {
      return {
        valid: this.isTokenValid((regToken as any).expiresAt),
      };
    }

    return { valid: false };
  }

  /**
   * Create a registration token for closed registration (no invite required).
   * Admin distributes token; valid token grants access to register.
   */
  async createRegistrationToken(expiresInDays?: number): Promise<{
    token: string;
    expiresAt: Date;
  }> {
    const days =
      expiresInDays ??
      this.configService.get<number>('DEFAULT_INVITE_EXPIRATION_DAYS') ??
      7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      const token = crypto.randomBytes(16).toString('hex');
      try {
        await this.registrationTokenModel.create({ token, expiresAt });
        this.logger.log(
          `Created registration token, expiresAt=${expiresAt.toISOString()}`,
        );
        return { token, expiresAt };
      } catch (err: unknown) {
        const isDuplicate =
          err &&
          typeof err === 'object' &&
          'code' in err &&
          (err as { code?: number }).code === 11000;
        if (isDuplicate && i < maxRetries - 1) continue;
        throw err;
      }
    }
    throw new Error('Failed to create registration token after retries');
  }
}
