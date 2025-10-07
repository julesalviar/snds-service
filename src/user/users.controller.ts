import {
  Controller,
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
  async getUsers(): Promise<User[]> {
    try {
      return await this.userService.getUsers();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('by-role/:role')
  async getUsersByRole(
    @Param('role') role: UserRole,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ): Promise<User[]> {
    try {
      const maxLimit = Math.min(limit || 50, 100); // Cap at 100, default to 50
      return await this.userService.getUsersByRole(role, search, maxLimit);
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
}
