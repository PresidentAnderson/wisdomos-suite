import { IsString, IsArray, IsOptional, IsIn, IsNotEmpty } from 'class-validator';

export class CreateContributionDto {
  @IsString()
  @IsIn(['Doing', 'Being', 'Having'])
  category: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  contributions: string[];

  @IsString()
  @IsOptional()
  impact?: string;

  @IsString()
  @IsOptional()
  commitment?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @IsIn(['private', 'shared', 'public'])
  visibility?: string;
}

export class UpdateContributionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  contributions?: string[];

  @IsString()
  @IsOptional()
  impact?: string;

  @IsString()
  @IsOptional()
  commitment?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @IsIn(['private', 'shared', 'public'])
  visibility?: string;
}