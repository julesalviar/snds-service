import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InternalReferenceDataDocument } from 'src/internal-reference-data/internal-reference-data.schema';
import { PROVIDER } from 'src/common/constants/providers';
import { BaseReferenceDataService } from 'src/common/services/base-reference-data.service';

@Injectable()
export class InternalReferenceDataService extends BaseReferenceDataService<InternalReferenceDataDocument> {
  protected model: Model<InternalReferenceDataDocument>;

  constructor(
    @Inject(PROVIDER.INTERNAL_REFERENCE_DATA_MODEL)
    internalReferenceDataModel: Model<InternalReferenceDataDocument>,
  ) {
    super();
    this.model = internalReferenceDataModel;
  }
}
