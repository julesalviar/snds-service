import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { InternalReferenceDataService } from 'src/internal-reference-data/internal-reference-data.service';
import { allowedValuesFromRefData } from 'src/common/utils/reference-data.util';
import { toFundSourceArray, FUND_SOURCE_REF_DATA_KEY } from './fund-source.util';

@Injectable()
export class FundSourceRefDataValidationPipe implements PipeTransform {
  constructor(
    private readonly internalReferenceDataService: InternalReferenceDataService,
  ) {}

  async transform(
    value: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const fundSource = value?.fundSource;
    if (fundSource === undefined || fundSource === null) return value;

    const ref = await this.internalReferenceDataService.getByKey(
      FUND_SOURCE_REF_DATA_KEY,
    );
    const allowed = allowedValuesFromRefData(ref);

    const valuesToValidate = toFundSourceArray(
      fundSource as string | string[] | undefined,
    );
    if (!valuesToValidate || valuesToValidate.length === 0) return value;

    if (allowed.length > 0) {
      const invalid = valuesToValidate.filter((v) => !allowed.includes(v));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `fundSource must be one or more of the values from reference data (key: "${FUND_SOURCE_REF_DATA_KEY}"): ${allowed.join(', ')}. Invalid value(s): ${invalid.join(', ')}`,
        );
      }
    }

    // Normalize to string[] so downstream (service, schema) only sees array
    value.fundSource = valuesToValidate;
    return value;
  }
}
