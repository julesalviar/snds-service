import { IsString, IsOptional, Matches } from 'class-validator';

export class GetSchoolSummaryDto {
  @IsString()
  @Matches(/^\d{4}-\d{4}$/, {
    message: 'schoolYear must be in format YYYY-YYYY',
  })
  schoolYear: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  districtOrCluster?: string;
}

export class SchoolSummaryResponseDto {
  schoolId: string;
  schoolName: string;
  division?: string;
  districtOrCluster?: string;
  accomplishmentPercentage: number;
  numberOfNeeds: number;
  engagementCount?: number;
  aipCount?: number;
}

export class SchoolDetailedSummaryResponseDto {
  schoolId: string;
  schoolName: string;
  division?: string;
  districtOrCluster?: string;
  currentYear: {
    accomplishmentPercentage: number;
    numberOfNeeds: number;
    engagementCount: number;
  };
  allTime: {
    totalAccomplishmentPercentage: number;
    totalNumberOfNeeds: number;
    totalEngagementCount: number;
  };
}

