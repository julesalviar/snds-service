import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class StakeHolderEngageDto {
  @IsOptional()
  code: number;

  @IsNotEmpty()
  donatedAmount: number;

  @IsNotEmpty()
  typeOfStakeholder: string;

  @IsNotEmpty()
  amountContributionOrAppraisedValue: number;

  @IsNotEmpty()
  unitMeasure: string;

  @IsNotEmpty()
  @IsDateString()
  moaSigningDate: string;

  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate: string;

  @IsOptional()
  createdBy: string;

  @IsOptional()
  updatedBy: string;
}
