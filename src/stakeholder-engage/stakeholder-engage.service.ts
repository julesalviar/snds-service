import { Model, Types } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { StakeHolderEngageDto } from 'src/stakeholder-engage/stakeholder-engage.dto';
import {
  StakeholderEngage,
  StakeholderEngageDocument,
} from './stakeholder-engage.schema';

@Injectable()
export class StakeholderEngageService {
  private readonly logger = new Logger(StakeholderEngageService.name);
  constructor(
    @Inject(PROVIDER.STAKEHOLDER_ENGAGE_MODEL)
    private readonly stakeHolderEngageModel: Model<StakeholderEngage>,
  ) {}
  async createStakeholderEngagementDetail(
    stakeHolderEngageDto: StakeHolderEngageDto,
  ): Promise<StakeholderEngageDocument> {
    try {
      this.logger.log(
        'Creating new School Needs engagement details with the following data:',
        stakeHolderEngageDto,
      );
      const createdEngagementDetail = new this.stakeHolderEngageModel(
        stakeHolderEngageDto,
      );
      const savedEngagementDetail = await createdEngagementDetail.save();
      return savedEngagementDetail;
    } catch (error) {
      this.logger.error(
        'Error creating stakeholder engagement details',
        error.stack,
      );
      throw error;
    }
  }
}
