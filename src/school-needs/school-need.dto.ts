import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { SchoolNeedStatus } from './school-need.enums';

export class NeedDto {
  @IsOptional()
  code: number;

  @IsNotEmpty()
  schoolObjId: string;

  @IsNotEmpty()
  projectObjId: string;

  @IsNotEmpty()
  projectDescription: string;

  @IsNotEmpty()
  projectPillars: string;

  @IsNotEmpty()
  projectContributionType: string;

  @IsNotEmpty()
  projectSpecificContribution: string;

  @IsOptional()
  createdByUserId: string;

  @IsOptional()
  quantityNeeded: number;

  @IsNotEmpty()
  unitMeasure: string;

  @IsNotEmpty()
  estimatedCost: number;

  @IsNotEmpty()
  numberOfBeneficiaryStudents: number;

  @IsNotEmpty()
  numberOfBeneficiaryPersonnel: number;

  @IsOptional()
  @IsDateString()
  targetImplementationDate: string;

  @IsNotEmpty()
  needDescriptionOrInfo: string;

  @IsOptional()
  uploadedPhotos: [{ type: String }];

  @IsOptional()
  @IsEnum(SchoolNeedStatus, {
    message: 'statusOfImplementation must be a valid SchoolNeedStatus value',
  })
  statusOfImplementation: string;

  @IsOptional()
  updatedBy: string;
}

export class UpdateNeedDto extends PartialType(NeedDto) {}

export class UpdateSchoolNeedStatusDto {
  @IsNotEmpty()
  @IsEnum(SchoolNeedStatus, {
    message: 'statusOfImplementation must be a valid SchoolNeedStatus value',
  })
  statusOfImplementation: SchoolNeedStatus;
}
