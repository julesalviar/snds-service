import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { SchoolNeedStatus } from './school-need.enums';

export class SchoolNeedDto {
  @IsNotEmpty()
  projectId: string;

  @IsNotEmpty()
  schoolId: string;

  @IsOptional()
  code: number;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  contributionType: string;

  @IsNotEmpty()
  specificContribution: string;

  @IsOptional()
  quantity: number;

  @IsNotEmpty()
  unit: string;

  @IsNotEmpty()
  estimatedCost: number;

  @IsNotEmpty()
  studentBeneficiaries: number;

  @IsNotEmpty()
  personnelBeneficiaries: number;

  @IsOptional()
  @IsDateString()
  implementationDate: string;

  @IsOptional()
  images: [{ type: string }];

  @IsOptional()
  @IsEnum(SchoolNeedStatus, {
    message: 'implementationStatus must be a valid SchoolNeedStatus value',
  })
  implementationStatus: string;

  @IsOptional()
  createdBy: string;

  @IsOptional()
  updatedBy: string;
}

export class UpdateNeedDto extends PartialType(SchoolNeedDto) {}

export class UpdateSchoolNeedStatusDto {
  @IsNotEmpty()
  @IsEnum(SchoolNeedStatus, {
    message: 'statusOfImplementation must be a valid SchoolNeedStatus value',
  })
  statusOfImplementation: SchoolNeedStatus;
}
