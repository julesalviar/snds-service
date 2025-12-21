import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly username: string;
  private readonly password: string;

  constructor(private readonly configService: ConfigService) {
    this.username = this.configService.get<string>('BASIC_AUTH_USERNAME');
    this.password = this.configService.get<string>('BASIC_AUTH_PASSWORD');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );
    const [username, password] = credentials.split(':');

    if (username !== this.username || password !== this.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}
