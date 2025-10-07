import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsString,
  IsPositive,
  Min,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import mongoose from 'mongoose';

export class EngagementDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsMongoId({
    message: `stakeholderUserId must be a valid stakeholder id.`,
  })
  stakeholderUserId: string | mongoose.Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNotEmpty()
  @IsDateString()
  signingDate: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsNotEmpty()
  @IsMongoId({
    message: `schoolNeedId must be a valid school need id.`,
  })
  schoolNeedId: string | mongoose.Types.ObjectId;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

export class CreateEngagementDto extends OmitType(EngagementDto, [
  'createdAt',
  'updatedAt',
] as const) {}

export class UpdateEngagementDto extends PartialType(CreateEngagementDto) {}

export class EngagementResponseDto {
  _id: string;
  amount: number;
  quantity: number;
  stakeholderUserId: string;
  unit: string;
  signingDate: string;
  startDate?: string;
  endDate?: string;
  schoolNeedId?: string;
  schoolId: string;
  schoolYear: string;
  specificContribution: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EngagementSummaryDto {
  specificContribution: string;
  schoolYear: string;
  schoolId: any;
  totalAmount: number;
  totalQuantity: number;
  engagementCount: number;
}
