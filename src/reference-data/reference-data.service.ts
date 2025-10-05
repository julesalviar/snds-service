import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ReferenceData,
  ReferenceDataDocument,
} from 'src/reference-data/reference-data.schema';
import { Model } from 'mongoose';
import { BaseReferenceDataService } from 'src/common/services/base-reference-data.service';

@Injectable()
export class ReferenceDataService extends BaseReferenceDataService<ReferenceDataDocument> {
  protected model: Model<ReferenceDataDocument>;

  constructor(
    @InjectModel(ReferenceData.name)
    referenceDataModel: Model<ReferenceDataDocument>,
  ) {
    super();
    this.model = referenceDataModel;
  }
}
