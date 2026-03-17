import { ActivityDto, UpdateActivityDto } from './activity.dto';
import { UserRole } from 'src/user/enums/user-role.enum';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from './activity.schema';
import { PROVIDER } from '../common/constants/providers';
import { COUNTER } from '../common/constants/counters';
import { CounterService } from '../common/counter/counter.services';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SchoolDocument } from 'src/schools/school.schema';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @Inject(PROVIDER.ACTIVITY_MODEL)
    private readonly activityModel: Model<Activity>,

    @Inject(PROVIDER.SCHOOL_MODEL)
    private readonly schoolModel: Model<SchoolDocument>,

    private readonly counterService: CounterService,
  ) {}

  async create(
    activityDto: ActivityDto,
    userSchoolId?: string,
    activeRole?: UserRole,
  ): Promise<ActivityDocument> {
    try {
      if (activeRole === UserRole.SCHOOL_ADMIN) {
        if (!userSchoolId) {
          throw new ForbiddenException(
            'School admin must have a schoolId to create activities',
          );
        }
        activityDto = { ...activityDto, schoolId: userSchoolId };
      }

      this.logger.log(
        'Creating activity with the following data:',
        activityDto,
      );

      const activityNumber = await this.counterService.getNextSequenceValue(
        COUNTER.ACTIVITY_REFERENCE,
      );
      const createdActivity = new this.activityModel({
        ...activityDto,
        activityNumber,
      });
      const savedActivity = await createdActivity.save();

      this.logger.log(
        `Activity created successfully with ID: ${savedActivity._id}`,
      );
      return savedActivity;
    } catch (error) {
      this.logger.error('Error creating activity', error.stack);

      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyValue).join(', ');
        throw new BadRequestException(
          `Duplicate entry for field(s): ${duplicateField}`,
        );
      }
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    type?: string,
    active?: string,
    activityNumber?: string,
    schoolId?: string,
  ) {
    try {
      this.logger.log(
        `Attempting to retrieve all paginated activities: page = ${page}, limit = ${limit}`,
      );

      const skip = (page - 1) * limit;
      const filter: any = {};

      if (type) filter.type = type;
      if (active !== undefined && active !== '') {
        filter.active = active === 'true';
      }
      if (activityNumber) filter.activityNumber = Number(activityNumber);
      if (schoolId && Types.ObjectId.isValid(schoolId)) {
        filter.schoolId = schoolId;
      }

      if (search) {
        const searchConditions: any[] = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
        const schools = await this.schoolModel
          .find({ schoolName: { $regex: search, $options: 'i' } })
          .select('_id schoolName')
          .lean()
          .exec();
        if (schools.length > 0) {
          searchConditions.push({
            schoolId: { $in: schools.map((s) => s._id.toString()) },
          });
        }
        filter.$or = searchConditions;
      }

      const [activities, total] = await Promise.all([
        this.activityModel
          .find(filter)
          .populate({
            path: 'schoolId',
            select: 'schoolName division schoolName districtOrCluster logoUrl',
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.activityModel.countDocuments(filter),
      ]);

      return {
        success: true,
        data: activities,
        meta: {
          count: activities.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          search: search || 'none',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting activities', error.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to retrieve activity with ID: ${id}`);
      const objectId = new Types.ObjectId(id);
      const activity = await this.activityModel.findById(objectId).exec();

      if (!activity) {
        throw new NotFoundException(`Activity with ID ${id} not found`);
      }

      return {
        success: true,
        data: activity,
        meta: { timestamp: new Date() },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
      this.logger.error('Error getting activity by id', error.stack);
      throw error;
    }
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    userSchoolId?: string,
    activeRole?: UserRole,
  ) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to update activity with ID: ${id}`);

      const objectId = new Types.ObjectId(id);
      const existingActivity = await this.activityModel.findById(objectId);

      if (!existingActivity) {
        throw new NotFoundException(`Activity with ID ${id} not found`);
      }

      if (activeRole === UserRole.SCHOOL_ADMIN) {
        if (!userSchoolId) {
          throw new ForbiddenException(
            'School admin must have a schoolId to update activities',
          );
        }
        const activitySchoolId = existingActivity.schoolId?.toString();
        if (activitySchoolId !== userSchoolId) {
          throw new ForbiddenException(
            'School admin can only update activities for their school',
          );
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { activityNumber, schoolId, ...updateData } = updateActivityDto;

      const updatedActivity = await this.activityModel
        .findByIdAndUpdate(
          objectId,
          { $set: updateData },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedActivity) {
        throw new NotFoundException(`Activity with ID ${id} not found`);
      }

      this.logger.log(`Activity updated successfully with ID: ${objectId}`);
      return {
        success: true,
        data: updatedActivity,
        meta: { timestamp: new Date() },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
      this.logger.error('Error updating activity', error.stack);
      throw error;
    }
  }

  async remove(id: string, userSchoolId?: string, activeRole?: UserRole) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const objectId = new Types.ObjectId(id);
      this.logger.log(`Attempting to delete activity with ID: ${id}`);

      const existingActivity = await this.activityModel.findById(objectId);

      if (!existingActivity) {
        throw new NotFoundException(`Activity with ID ${id} not found`);
      }

      if (activeRole === UserRole.SCHOOL_ADMIN) {
        if (!userSchoolId) {
          throw new ForbiddenException(
            'School admin must have a schoolId to delete activities',
          );
        }
        const activitySchoolId = existingActivity.schoolId?.toString();
        if (activitySchoolId !== userSchoolId) {
          throw new ForbiddenException(
            'School admin can only delete activities for their school',
          );
        }
      }

      await this.activityModel.findByIdAndDelete(objectId);

      this.logger.log(`Activity deleted successfully with ID: ${objectId}`);
      return {
        success: true,
        data: { message: 'Activity deleted successfully', objectId },
        meta: { timestamp: new Date() },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
      this.logger.error('Error deleting activity', error.stack);
      throw error;
    }
  }
}
