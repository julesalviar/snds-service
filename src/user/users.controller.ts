import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import { UserService } from './user.service';
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

  @Get(':id/my-contributions')
  async myContributions(@Param('id') id: string): Promise<any> {
    try {
      return await this.userService.getMyContributions(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
