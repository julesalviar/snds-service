import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ReferenceDataService } from 'src/reference-data/reference-data.service';

export const SCHOOL_OFFERING_REF_DATA_KEY = 'schoolOffering';

function allowedValuesFromRefData(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          if (typeof obj.value === 'string') return obj.value;
          if (typeof obj.code === 'string') return obj.code;
          if (typeof obj.id === 'string') return obj.id;
        }
        return null;
      })
      .filter((s): s is string => s != null);
  }
  if (typeof value === 'string') return [value];
  return [];
}

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
