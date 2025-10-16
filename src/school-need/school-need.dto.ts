import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class SchoolNeedDto {
  @IsOptional()
  schoolYear?: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  projectId: string[];

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
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];

  @IsOptional()
  @IsString()
  implementationStatus: string;

  @IsOptional()
  createdAt: string;

  @IsOptional()
  updatedAt: string;

  @IsOptional()
  engagements?: any;
}

export class SchoolCreateNeedDto extends OmitType(SchoolNeedDto, [
  'createdAt',
  'updatedAt',
]) {}

export class SchoolUpdateNeedDto extends PartialType(SchoolNeedDto) {}

export class SecureSchoolUpdateNeedDto extends PartialType(SchoolNeedDto) {
  // Allow MongoDB fields to be received but they will be filtered out by service
  @IsOptional()
  _id?: string;

  @IsOptional()
  school: any;

  @IsOptional()
  createdAt?: string;

  @IsOptional()
  updatedAt?: string;
}

export class SchoolNeedResponseDto extends OmitType(SchoolNeedDto, [
  'projectId',
  'schoolId',
  'createdAt',
  'updatedAt',
]) {
  @IsOptional()
  _id?: string;

  @IsOptional()
  createdAt?: string;

  @IsOptional()
  updatedAt?: string;

  @IsOptional()
  school?: any;

  @IsOptional()
  projectId?: any[];

  @IsOptional()
  engagements?: any[];
}

export class UpdateSchoolNeedStatusDto {
  @IsNotEmpty()
  @IsString()
  statusOfImplementation: string;
}

export class ImageDto {
  @IsString()
  id: string;

  @IsString()
  category: string;

  @IsUrl()
  originalUrl: string;

  @IsUrl()
  thumbnailUrl: string;
}
