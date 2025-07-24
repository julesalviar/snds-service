import { IsNotEmpty, MinLength, IsOptional, MaxLength } from 'class-validator';
import { AipStatus } from 'src/aip/aip-status.enum';

export class AipDto {
  @IsOptional()
  apn: number;

  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(9)
  schoolYear: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  objectives: string;

  @IsNotEmpty()
  pillars: string;

  @IsNotEmpty()
  responsiblePerson: string;

  @IsOptional()
  materialsNeeded: string;

  @IsNotEmpty()
  totalBudget: string;

  @IsOptional()
  budgetSource: string;

  @IsOptional()
  status: AipStatus;

  @IsOptional()
  createdBy: string;

  @IsOptional()
  updatedBy: string;
}
