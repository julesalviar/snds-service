import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDER } from '../common/constants/providers';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Tenant } from '../tenant/tenantSchema';
import { SchoolNeedService } from 'src/school-need/school-need.service';
import { EncryptionService } from 'src/encryption/encryption.service';
import { School } from 'src/schools/school.schema';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { CreateSchoolAdminDto } from 'src/common/dtos/create-school-admin.dto';

@Injectable()
export class UserService {
  logger: Logger;

  constructor(
    @Inject(PROVIDER.USER_MODEL) private readonly userModel: Model<User>,
    @Inject(PROVIDER.TENANT_MODEL) private readonly tenantModel: Model<Tenant>,
    @Inject(PROVIDER.SCHOOL_MODEL) private readonly schoolModel: Model<School>,
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

  async createUser(
    userData: CreateUserDto | CreateSchoolAdminDto,
  ): Promise<User> {
    const hashedPassword = await this.encryptionService.hashPassword(
      userData.password,
    );

    let schoolId: string | undefined;
    let schoolName: string | undefined;
    let isNewSchoolCreated = false;

    if ('schoolName' in userData && userData.schoolName) {
      schoolName = userData.schoolName;
      const existingSchool = await this.schoolModel
        .findOne({
          $or: [
            { schoolName: schoolName },
            { officialEmailAddress: userData.email }, // Use user's email as school's official email
          ],
        })
        .exec();

      if (existingSchool) {
        schoolId = existingSchool._id.toString();
        this.logger.log(`Using existing school: ${existingSchool.schoolName}`);
      } else {
        const schoolData = {
          schoolId: userData.schoolId,
          schoolName: schoolName,
          division: userData.division,
          districtOrCluster: userData.district,
          schoolOffering: userData.schoolOffering,
          accountablePerson: userData.nameOfAccountablePerson,
          designation: userData.designation,
          contactNumber: userData.contactNumber,
          officialEmailAddress: userData.email, // Use user's email as school's official email
          createdByUserId: null, // Will be updated after user creation
        };

        const newSchool = new this.schoolModel(schoolData);
        const savedSchool = await newSchool.save();
        schoolId = savedSchool._id.toString();
        isNewSchoolCreated = true;
        this.logger.log(`Created new school: ${savedSchool.schoolName}`);
      }
    }

    const newUser = new this.userModel({
      ...userData,
      name: schoolName || userData.name,
      password: hashedPassword,
      schoolId: schoolId,
    });

    const savedUser = await newUser.save();

    // Update the school with the user ID if a new school was created
    if (schoolId && isNewSchoolCreated) {
      await this.schoolModel
        .findByIdAndUpdate(schoolId, { createdByUserId: savedUser._id.toString() })
        .exec();
    }

    return savedUser;
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
