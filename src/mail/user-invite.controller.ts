import { Controller, Get, Query } from '@nestjs/common';
import { UserInviteService } from './user-invite.service';
import {
  ListUserInvitesQueryDto,
  ListUserInvitesResponseDto,
  UserInviteItemDto,
} from './user-invite.dto';

@Controller('user-invites')
export class UserInviteController {
  constructor(private readonly userInviteService: UserInviteService) {}

  @Get()
  async list(
    @Query() query: ListUserInvitesQueryDto,
  ): Promise<ListUserInvitesResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const email = query.email?.trim() || undefined;

    const result = await this.userInviteService.findAll(page, limit, email);

    const data: UserInviteItemDto[] = result.data.map((invite) => ({
      _id: (invite as any)._id?.toString?.() ?? (invite as any).id,
      email: invite.email,
      sentAt: invite.sentAt instanceof Date ? invite.sentAt.toISOString() : String(invite.sentAt),
      status: invite.status,
      ...(invite.createdAt && {
        createdAt:
          invite.createdAt instanceof Date
            ? invite.createdAt.toISOString()
            : String(invite.createdAt),
      }),
      ...(invite.updatedAt && {
        updatedAt:
          invite.updatedAt instanceof Date
            ? invite.updatedAt.toISOString()
            : String(invite.updatedAt),
      }),
    }));

    return {
      data,
      meta: result.meta,
    };
  }
}
