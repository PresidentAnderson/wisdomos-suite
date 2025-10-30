import { IsString, IsEmail, IsOptional, IsArray, IsUUID, IsNumber, IsEnum, IsDateString, Matches, Min, Max } from 'class-validator';

export enum InteractionChannel {
  CALL = 'call',
  SMS = 'sms',
  EMAIL = 'email',
  MEETING = 'meeting',
  NOTE = 'note',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  SIGNAL = 'signal',
  MESSENGER = 'messenger',
  OTHER = 'other'
}

export enum SentimentLabel {
  VERY_NEGATIVE = 'very_negative',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  POSITIVE = 'positive',
  VERY_POSITIVE = 'very_positive'
}

export enum InteractionDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  INTERNAL = 'internal'
}

export class UpsertContactDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^\+\d{8,15}$/, { message: 'Phone must be in E.164 format' })
  phone_e164?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  hubspot_id?: string;

  @IsOptional()
  @IsString()
  salesforce_id?: string;
}

export class CreateLinkDto {
  @IsUUID()
  contact_id: string;

  @IsNumber()
  life_area_id: number;

  @IsOptional()
  @IsString()
  role_label?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  weight?: number;

  @IsOptional()
  @IsString()
  outcomes?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class LogInteractionDto {
  @IsUUID()
  contact_id: string;

  @IsOptional()
  @IsNumber()
  life_area_id?: number;

  @IsEnum(InteractionChannel)
  channel: InteractionChannel;

  @IsOptional()
  @IsEnum(InteractionDirection)
  direction?: InteractionDirection;

  @IsOptional()
  @IsDateString()
  occurred_at?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body_text?: string;

  @IsOptional()
  @IsString()
  body_html?: string;

  @IsOptional()
  @IsString()
  uri?: string;

  @IsOptional()
  @IsEnum(SentimentLabel)
  sentiment?: SentimentLabel;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  @Max(1)
  sentiment_score?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  entities?: any;

  @IsOptional()
  meta?: Record<string, any>;
}

export class CreateAssessmentDto {
  @IsUUID()
  contact_id: string;

  @IsNumber()
  life_area_id: number;

  @IsOptional()
  @IsDateString()
  assessed_on?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  trust_score?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  communication?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  reliability?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  alignment?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  overall?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}