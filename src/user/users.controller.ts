import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserRole } from './enums/user-role.enum';
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

  @Get(':id/my-contributions')
  async myContributions(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<any> {
    try {
      return await this.userService.getMyContributions(
        id,
        Number(page),
        Number(limit),
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
