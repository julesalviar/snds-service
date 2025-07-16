import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ReferenceData,
  ReferenceDataDocument,
} from 'src/reference-data/reference-data.schema';
import { Model } from 'mongoose';
import { ReferenceStatus } from 'src/reference-data/reference-status.enum';

@Injectable()
export class ReferenceDataService {
  constructor(
    @InjectModel(ReferenceData.name)
    private referenceDataModel: Model<ReferenceDataDocument>,
  ) {}

  async getByStatus(
    status: ReferenceStatus = 'active',
  ): Promise<Record<string, any>> {
    const filter: Record<string, any> =
      status === 'active'
        ? { active: true }
        : status === 'inactive'
          ? { active: false }
          : {};

    const entries = await this.referenceDataModel.find(filter).lean();
    return entries.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }
}
