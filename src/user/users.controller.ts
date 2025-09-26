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
  ): Promise<User[]> {
    try {
      return await this.userService.getUsersByRole(role, search);
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
