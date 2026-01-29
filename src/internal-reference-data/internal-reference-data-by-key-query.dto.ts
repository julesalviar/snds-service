import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusQueryDto } from 'src/reference-data/status-query.dto';

export type SortOrder = 'asc' | 'desc';

export const SORT_ORDER: SortOrder[] = ['asc', 'desc'];

export class InternalReferenceDataByKeyQueryDto extends StatusQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().toLowerCase())
  sort?: string;
}
