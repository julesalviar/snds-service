import { Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import { UserInviteDocument } from './user-invite.schema';

export interface UserInviteListItem {
  _id: unknown;
  email: string;
  sentAt: Date;
  status: 'sent' | 'accepted';
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
}
