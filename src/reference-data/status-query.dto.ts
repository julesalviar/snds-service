import { IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  REFERENCE_STATUS,
  ReferenceStatus,
} from 'src/reference-data/reference-status.enum';

export class StatusQueryDto {
  @IsOptional()
  @Transform(({ value }) => value?.toString().toLowerCase())
  @IsIn([REFERENCE_STATUS])
  status?: ReferenceStatus;
}
