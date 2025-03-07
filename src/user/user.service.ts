import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PROVIDER } from '../common/constants/providers';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { Tenant } from '../tenant/tenantSchema';
import { Logger } from '@nestjs/common';
// import { AuthService } from 'src/auth/auth.service';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class UserService {
  logger: Logger;

  constructor(
    @Inject(PROVIDER.USER_MODEL) private userModel: Model<User>,
    @Inject(PROVIDER.TENANT_MODEL) private tenantModel: Model<Tenant>,
    // @Inject(forwardRef(() => AuthService)) private AuthService: AuthService,
    private readonly encryptionService: EncryptionService, // Inject EncryptionService
  ) {
    this.logger = new Logger(UserService.name);
  }

  async getUserByUsername(userName: string): Promise<User | null> {
    return await this.userModel
      .findOne({ userName })
      .select('+password')
      .exec();
  }

  async getUserByUserEmail(email: string): Promise<User | null> {
    return await this.userModel
      .findOne({ email })
      .exec();
  }

  async getUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async createUser(userData: User): Promise<User> {
    const hashedPassword = await this.encryptionService.hashPassword(
      userData.password,
    );
    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async validateUser(userName: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ userName }).exec();
    if (!user) return null;

    const isPasswordValid = await this.encryptionService.comparePassword(
      password,
      user.password,
    );
    return isPasswordValid ? user : null;
  }
}
