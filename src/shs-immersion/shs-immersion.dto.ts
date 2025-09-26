import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class ImmersionInfoDto {
  @IsOptional()
  immersionCode: number;

  @IsNotEmpty()
  schoolId: string;

  @IsNotEmpty()
  classification: string;

  @IsNotEmpty()
  schoolYear: string;

  @IsOptional()
  totalMaleBeneficiary: number;

  @IsOptional()
  totalFMaleBeneficiary: number;

  @IsNotEmpty()
  requiredHours: number;

  @IsNotEmpty()
  track: string;

  @IsNotEmpty()
  strand: string;

  @IsNotEmpty()
  contactPerson: number;

  @IsNotEmpty()
  contactNumber: number;

  @IsOptional()
  createdBy: string;
  @IsOptional()
  createdAt: string;
  @IsOptional()
  updatedBy: string;
}

// export class UpdateNeedDto extends PartialType(SchoolNeedDto) { }
export class ImmersionVenueDto {
  @IsNotEmpty()
  companyName: string;

  @IsNotEmpty()
  companyAddress: string;

  @IsNotEmpty()
  immersionCoordinator: string;

  @IsNotEmpty()
  deploymentSection: string;

  @IsNotEmpty()
  deployedMale: number;

  @IsNotEmpty()
  deployedFmale: number;

  @IsNotEmpty()
  contactPerson: string;

  @IsNotEmpty()
  contactNumber: string;

  @IsOptional()
  createdBy: string;
  @IsOptional()
  createdAt: string;
  @IsOptional()
  updatedBy: string;
}
