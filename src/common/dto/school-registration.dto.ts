import {
  IsEmail,
  IsNotEmpty,
  IsDefined,
  IsString,
  MinLength,
  Matches,
  IsIn,
} from 'class-validator';

export class SchoolRegistrationDto {
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
  @IsIn(['Elementary', 'Secondary', 'Senior High School', 'All Levels'])
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

  @IsDefined()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
