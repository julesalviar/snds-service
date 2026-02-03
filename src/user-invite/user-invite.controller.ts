import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserInviteService } from './user-invite.service';
import {
  ListUserInvitesQueryDto,
  ListUserInvitesResponseDto,
  UserInviteItemDto,
  ExtendExpiryBodyDto,
  VerifyTokenQueryDto,
  CreateRegistrationTokenBodyDto,
} from './user-invite.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('user-invites')
export class UserInviteController {
  constructor(private readonly userInviteService: UserInviteService) {}

  @Post('registration-tokens')
  async createRegistrationToken(
    @Body() body: CreateRegistrationTokenBodyDto,
  ): Promise<{ token: string; expiresAt: string }> {
    const result = await this.userInviteService.createRegistrationToken(
      body.expiresInDays,
    );
    return {
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  /**
   * Verify token for registration screen.
   * Same endpoint for both: invite tokens (UserInvite) and registration tokens (RegistrationToken).
   */
  @Public()
  @Get('verify')
  async verifyToken(
    @Query() query: VerifyTokenQueryDto,
  ): Promise<{ valid: boolean }> {
    return this.userInviteService.verifyToken(query.token);
  }

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
      sentAt:
        invite.sentAt instanceof Date
          ? invite.sentAt.toISOString()
          : String(invite.sentAt),
      status: invite.status,
      processingMethod: invite.processingMethod ?? 'synchronous',
      ...(invite.token && { token: invite.token }),
      ...(invite.expiresAt && {
        expiresAt:
          invite.expiresAt instanceof Date
            ? invite.expiresAt.toISOString()
            : String(invite.expiresAt),
      }),
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

  @Patch(':id/extend-expiry')
  async extendExpiry(
    @Param('id') id: string,
    @Body() body: ExtendExpiryBodyDto,
  ): Promise<{ expiresAt: string }> {
    const extendByDays = body.extendByDays ?? 7;
    const result = await this.userInviteService.extendExpiry(id, extendByDays);
    return {
      expiresAt: result.expiresAt.toISOString(),
    };
  }
}
