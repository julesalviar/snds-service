import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import mongoose from 'mongoose';
import { PlanClassification } from './plan-classification.enum';
import { PlanImplementationStatus } from './plan-implementation-status.enum';
import { PlanParticipant } from './plan-participant.enum';
import { Transform } from 'class-transformer';

export class CreatePpaPlanDto {
  @IsOptional()
  @IsNumber()
  ppn?: number;

  @IsNotEmpty()
  @IsString()
  kra: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  activity: string;

  @IsNotEmpty()
  @IsString()
  objective: string;

  @IsNotEmpty()
  @IsEnum(PlanClassification, {
    message: `classification must be one of: ${Object.values(PlanClassification).join(', ')}`,
  })
  classification: PlanClassification;

  @IsNotEmpty()
  @IsString()
  expectedOutput: string;

  @IsOptional()
  @IsString()
  implementationStartDate?: string;

  @IsOptional()
  @IsString()
  implementationEndDate?: string;

  @IsOptional()
  @IsNumber()
  budgetaryRequirement?: number;

  @IsOptional()
  @IsString()
  materialsAndSupplies?: string;

  @IsOptional()
  @IsString()
  fundSource?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(PlanParticipant, {
    each: true,
    message: `participants must be valid values: ${Object.values(PlanParticipant).join(', ')}`,
  })
  participants: PlanParticipant[];

  @IsOptional()
  @IsString()
  supportNeed?: string;

  @IsOptional()
  @IsNumber()
  supportReceivedValue?: number;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsMongoId({ message: 'stakeholderUserId must be a valid user id' })
  stakeholderUserId?: string | mongoose.Types.ObjectId;

  @IsOptional()
  @IsMongoId({ message: 'assignedUserId must be a valid user id' })
  assignedUserId?: string | mongoose.Types.ObjectId;

  @IsOptional()
  @IsMongoId({ message: 'officeId must be a valid office id' })
  officeId?: string | mongoose.Types.ObjectId;

  @IsOptional()
  @IsNumber()
  amountUtilized?: number;

  @IsNotEmpty()
  @IsEnum(PlanImplementationStatus, {
    message: `implementationStatus must be one of: ${Object.values(PlanImplementationStatus).join(', ')}`,
  })
  implementationStatus: PlanImplementationStatus;

  @IsOptional()
  @IsString()
  factors?: string;

  @IsOptional()
  @IsString()
  timeliness?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reportUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];
}

export class UpdatePpaPlanDto extends PartialType(
  OmitType(CreatePpaPlanDto, ['ppn'] as const),
) {}
