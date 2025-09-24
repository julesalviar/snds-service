import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDER } from '../common/constants/providers';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Tenant } from '../tenant/tenantSchema';
import { SchoolNeedService } from 'src/school-need/school-need.service';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class UserService {
  logger: Logger;

  constructor(
    @Inject(PROVIDER.USER_MODEL) private readonly userModel: Model<User>,
    @Inject(PROVIDER.TENANT_MODEL) private readonly tenantModel: Model<Tenant>,
    private readonly encryptionService: EncryptionService, // Inject EncryptionService
    private readonly schoolNeedService: SchoolNeedService,
  ) {
    this.logger = new Logger(UserService.name);
  }

  async getUserByUsername(userName: string): Promise<User | null> {
    return await this.userModel
      .findOne({ userName })
      .select('+password')
      .exec();
  }

  async getMyContributions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<any> {
    return await this.schoolNeedService.getStakeholderContributions(
      userId,
      page,
      limit,
    );
  }

  async getUserByUserEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
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
