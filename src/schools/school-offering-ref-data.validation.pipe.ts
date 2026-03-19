import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ReferenceDataService } from 'src/reference-data/reference-data.service';
import { allowedValuesFromRefData } from 'src/common/utils/reference-data.util';

export const SCHOOL_OFFERING_REF_DATA_KEY = 'schoolOffering';

@Injectable()
export class SchoolOfferingRefDataValidationPipe implements PipeTransform {
  constructor(
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  async transform(
    value: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const offering = value?.schoolOffering;
    if (offering === undefined || offering === null) return value;

    const ref = await this.referenceDataService.getByKey(
      SCHOOL_OFFERING_REF_DATA_KEY,
    );
    const allowed = allowedValuesFromRefData(ref);
    const normalized = typeof offering === 'string' ? offering : String(offering);

    if (allowed.length && !allowed.includes(normalized)) {
      throw new BadRequestException(
        `schoolOffering must be one of the values from reference data (key: "${SCHOOL_OFFERING_REF_DATA_KEY}"): ${allowed.join(', ')}`,
      );
    }

    return value;
  }
}
