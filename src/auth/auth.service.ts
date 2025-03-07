import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.schema';
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class AuthService {
  constructor(
    // @Inject(forwardRef(() => UserService)) private userService: UserService,
    private userService: UserService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async signUp(userData: Partial<User>): Promise<User> {
    const existingUser = await this.userService.getUserByUsername(
      userData.userName,
    );
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.userService.getUserByUserEmail(
      userData.email,
    );

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    return this.userService.createUser(userData as User);
  }

  async signIn(dto: {
    userName: string;
    password: string;
  }): Promise<{ access_token: string }> {
    const { userName, password } = dto;
    const user: User = await this.userService.getUserByUsername(userName);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.encryptionService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id, username: user.userName };
    const accessToken = await this.jwtService.signAsync(payload);

    return { access_token: accessToken };
  }
}
