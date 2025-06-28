import { IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class NeedDto {
  @IsOptional()
  code: number;

  @IsNotEmpty()
  projectObjId: string;

  @IsOptional()
  createdByUserId: string;

  @IsOptional()
  quantityNeeded: number;

  @IsNotEmpty()
  unitMeasure: string;

  @IsNotEmpty()
  estimatedCost: number;

  @IsNotEmpty()
  numberOfBeneficiaryStudents: number;

  @IsNotEmpty()
  numberOfBeneficiaryPersonnel: number;

  @IsOptional()
  targetImplementationDate: string;

  @IsNotEmpty()
  descriptionOrInfo: string;

  @IsOptional()
  uploadedPhotos: [{ type: String }];

  @IsOptional()
  statusOfImplementation: string;

  @IsOptional()
  updatedBy: string;
}
