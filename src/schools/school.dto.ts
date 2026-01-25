import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsDefined,
  IsString,
  Matches,
  IsEnum,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { schoolOffering } from './school.enums';

export class SchoolDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  region: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  division: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  districtOrCluster: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  schoolName: string;

  @IsDefined()
  @IsNotEmpty()
  @Matches(/^\d{3,}$/, {
    message: 'School Id must be numeric with at least 3 digits (e.g., "123")',
  })
  schoolId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEnum(schoolOffering, {
    message: 'schoolOffering data is not a valid School Offering value',
  })
  schoolOffering: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  accountablePerson: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsDefined()
  @IsNotEmpty()
  @Matches(/^09\d{9}$/, {
    message:
      "Contact number must be in valid PH number format e.g. '09xxxxxxxxx",
  })
  contactNumber: string;

  @IsDefined()
  @IsEmail()
  officialEmailAddress: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  profileDocUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;
}

export class UpdateSchoolDto extends PartialType(SchoolDto) {}
