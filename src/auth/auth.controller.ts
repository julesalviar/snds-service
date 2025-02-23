import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/user/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() userData: Partial<User>) {
    return this.authService.signUp(userData);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() dto: { userName: string; password: string }) {
    return this.authService.signIn(dto);
  }
}
