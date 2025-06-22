import {
    IsEmail,
    IsNotEmpty,
    IsDefined,
    IsString,
    MinLength,
    IsOptional,
} from 'class-validator';

export class AipDto {
    @IsDefined()
    @IsNotEmpty()
    @MinLength(5)
    title: string;

    @IsDefined()
    @IsNotEmpty()
    @MinLength(5)
    objectives: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
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

}
