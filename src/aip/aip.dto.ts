import {
  IsEmail,
  IsNotEmpty,
  IsDefined,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class AipDto {
  @IsNotEmpty()
  @MinLength(4)
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
  status: string;

  @IsOptional()
  createdBy: string;

  @IsOptional()
  updatedBy: string;
}
