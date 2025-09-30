import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  totalFemaleBeneficiary: number;

  @IsNotEmpty()
  requiredHours: number;

  @IsNotEmpty()
  track: string;

  @IsNotEmpty()
  strand: string;

  @IsNotEmpty()
  contactPerson: string;

  @IsNotEmpty()
  contactNumber: string;

  @IsOptional()
  venues: [ImmersionVenueDto];

  @IsOptional()
  createdBy: string;

  @IsOptional()
  @IsDateString()
  createdAt: string;
  @IsOptional()
  updatedBy: string;
}

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
  @Type(() => Number)
  @IsNumber()
  deployedMale: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  deployedFemale: number;

  @IsNotEmpty()
  contactPerson: string;

  @IsNotEmpty()
  contactNumber: string;

  @IsOptional()
  createdBy: string;
  @IsOptional()
  createdAt: string;
  @IsOptional()
  updatedAt: string;
  @IsOptional()
  updatedBy: string;
}
