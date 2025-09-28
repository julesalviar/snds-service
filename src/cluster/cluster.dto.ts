import { IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class ClusterDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  division: string;

  @IsOptional()
  code: string;

  @IsOptional()
  createdBy: string;

  @IsOptional()
  updatedBy: string;
}

export class UpdateClusterDto extends PartialType(ClusterDto) {}
