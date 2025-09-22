import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { SchoolNeedStatus } from './school-need.enums';
import { StakeHolderEngageDto } from 'src/school-need/stakeholder-engage.dto';

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
  @IsOptional()
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
  targetDate: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsEnum(SchoolNeedStatus, {
    message: 'implementationStatus must be a valid SchoolNeedStatus value',
  })
  implementationStatus: string;

  @IsOptional()
  engagement: [StakeHolderEngageDto];

  @IsOptional()
  createdBy: string;

  @IsOptional()
  updatedBy: string;
}

export class UpdateNeedDto extends PartialType(SchoolNeedDto) {}
export class UpdateSchoolNeedStatusDto {
  @IsNotEmpty()
  @IsEnum(SchoolNeedStatus, {
    message: 'implementationStatus must be a valid SchoolNeedStatus value',
  })
  statusOfImplementation: SchoolNeedStatus;
}
