import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from 'src/encryption/encryption.service';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { CreateSchoolAdminDto } from 'src/common/dtos/create-school-admin.dto';
import { RolePermissions } from 'src/common/constants/role-permission';
import { UserRole } from 'src/user/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async signUp(
    signupData: CreateUserDto | CreateSchoolAdminDto,
  ): Promise<User> {
    const existingUser = await this.userService.getUserByUsername(
      signupData.userName,
    );
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.userService.getUserByUserEmail(
      signupData.email,
    );

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    return this.userService.createUser(signupData);
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

    return { access_token: await this.issueAccessToken(user) };
  }

  async assignRoles(
    userId: string,
    roles: UserRole[],
    schoolId?: string,
    officeIds?: string[],
  ): Promise<User> {
    return this.userService.assignRoles(userId, roles, schoolId, officeIds);
  }

  async switchRole(
    userId: string,
    newRole: UserRole,
    currentRoles: UserRole[],
  ): Promise<{ access_token: string }> {
    if (!currentRoles.includes(newRole)) {
      throw new BadRequestException(
        'You do not have permission to switch to this role',
      );
    }

    const updatedUser = await this.userService.updateActiveRole(
      userId,
      newRole,
    );

    const user = await this.userService.getUserByUsername(updatedUser.userName);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { access_token: await this.issueAccessToken(user) };
  }

  private buildAccessTokenPayload(user: User): Record<string, unknown> {
    const { role, activeRole, roles, schoolId, officeIds } = user;
    const effectiveRole = activeRole ?? role;
    const perms = RolePermissions[effectiveRole] ?? [];

    const payload: Record<string, unknown> = {
      sub: user._id,
      username: user.userName,
      name: user.name,
      role,
      activeRole,
      roles,
      perms,
    };
    if (effectiveRole === UserRole.SCHOOL_ADMIN) {
      payload.sid = schoolId ?? '';
    }
    if (effectiveRole === UserRole.PROGRAM_HOLDER) {
      payload.oids = officeIds ?? '';
    }
    return payload;
  }

  private async issueAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync(this.buildAccessTokenPayload(user));
  }
}
