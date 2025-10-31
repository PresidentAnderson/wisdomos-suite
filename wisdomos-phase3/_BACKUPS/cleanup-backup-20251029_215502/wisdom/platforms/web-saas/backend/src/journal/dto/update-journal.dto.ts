import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

export class UpdateJournalDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}