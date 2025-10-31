import { IsString, IsUUID, IsArray, IsOptional, MinLength } from 'class-validator';

export class CreateJournalDto {
  @IsUUID()
  lifeAreaId: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}