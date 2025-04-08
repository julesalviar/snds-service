import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { SignupDto } from 'src/common/dto/signup.dto';
import { LoginDto } from 'src/common/dto/login.dto';
import { User } from 'src/user/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signupDto: SignupDto) {
  // userData: Partial<User>) {
    return this.authService.signUp(signupDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }
}
