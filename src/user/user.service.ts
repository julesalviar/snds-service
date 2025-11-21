import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PROVIDER } from '../common/constants/providers';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { UserRole } from './enums/user-role.enum';
import { Tenant } from '../tenant/tenantSchema';
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
    return await this.userModel.findOne({ email }).exec();
  }

  async getUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async getUsersWithRole(
    role: UserRole,
    searchTerm?: string,
    limit: number = 50,
  ): Promise<User[]> {
    const query: any = { roles: { $in: [role] } };

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    return await this.userModel.find(query).limit(limit).exec();
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
        .findByIdAndUpdate(schoolId, {
          createdByUserId: savedUser._id.toString(),
        })
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

  async changeMyPassword(userName: string, newPasswordData: any): Promise<any> {
    const { currentPassword, newPassword } = newPasswordData;
    const userData: User = await this.getUserByUsername(userName);
    const isPasswordValid = await this.encryptionService.comparePassword(
      currentPassword,
      userData.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }
    const hashedPassword =
      await this.encryptionService.hashPassword(newPassword);
    await this.userModel
      .findByIdAndUpdate(userData._id.toString(), {
        password: hashedPassword,
      })
      .exec();
    return {
      success: true,
      meta: {
        username: userName,
        remarks: 'Login password changed',
        timestamp: new Date(),
      },
    };
  }
  async updateProfile(userName: string, updatedProfileInfo: any): Promise<any> {
    try {
      const userData: User = await this.getUserByUsername(userName);

      this.logger.log(
        `Attempting to update user profile for user: ${userName}`,
      );
      const updatedUserInfo = await this.userModel
        .findByIdAndUpdate(
          userData._id.toString(),
          { $set: updatedProfileInfo },
          { new: true, runValidators: true },
        )
        .exec();

      this.logger.log(
        `User's profile info successfully updated for : ${userData.userName}`,
      );
      return {
        success: true,
        data: [updatedUserInfo],
        meta: {
          remarks: 'Profile Updated',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Error updating User's Profile`, error.stack);
      throw error;
    }
  }
}
