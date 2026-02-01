import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserInfo } from 'src/user/user.decorator';
import { User } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserRole } from './enums/user-role.enum';
import { UpdateUserDto } from 'src/common/dtos/create-user.dto';
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('roles') roles?: string | string[],
    @Query('includeReferenceAccounts') includeReferenceAccounts?: string,
  ) {
    try {
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
      const rolesList = this.parseRolesQuery(roles);
      const includeRefAccounts = includeReferenceAccounts === 'true';
      return await this.userService.getUsers(
        pageNum,
        limitNum,
        search,
        rolesList,
        includeRefAccounts,
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private parseRolesQuery(roles?: string | string[]): UserRole[] | undefined {
    if (roles == null || roles === '') return undefined;
    const raw = Array.isArray(roles)
      ? roles
      : roles.split(',').map((r) => r.trim());
    const valid = raw.filter(
      (r) => r && Object.values(UserRole).includes(r as UserRole),
    );
    return valid.length > 0 ? (valid as UserRole[]) : undefined;
  }

  @Get('by-role/:role')
  async getUsersByRole(
    @Param('role') role: UserRole,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ): Promise<User[]> {
    try {
      const maxLimit = Math.min(limit || 50, 100); // Cap at 100, default to 50
      return await this.userService.getUsersWithRole(role, search, maxLimit);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('change-password')
  async changePassword(
    @UserInfo('username') userName: string,
    @Body() newPasswordData: any,
  ): Promise<any> {
    try {
      return await this.userService.changeMyPassword(userName, newPasswordData);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('update-profile')
  async updateProfile(
    @UserInfo('username') userName: string,
    @Body() updatedProfileInfo: UpdateUserDto,
  ): Promise<any> {
    try {
      return await this.userService.updateProfile(userName, updatedProfileInfo);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteUserById(@Param('id') id: string): Promise<{ deleted: boolean }> {
    try {
      return await this.userService.deleteUserById(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
