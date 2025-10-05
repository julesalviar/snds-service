import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class StakeHolderEngageDto {
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  @IsMongoId({
    message: `stakeholderId must be a valid stakeholder id.`,
  })
  stakeholderId: string;

  @IsNotEmpty()
  unit: string;

  @IsNotEmpty()
  @IsDateString()
  signingDate: string;

  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
