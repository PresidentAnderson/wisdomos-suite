import { IsString, IsOptional, IsEmail, IsNumber, IsObject } from 'class-validator';

export class CreateContactDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  lifecyclestage?: string;
}

export class UpdateContactDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  lifecyclestage?: string;
}

export class CreateDealDto {
  @IsString()
  dealname: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  dealstage?: string;

  @IsOptional()
  @IsString()
  pipeline?: string;

  @IsOptional()
  @IsString()
  closedate?: string;

  @IsOptional()
  @IsString()
  hubspot_owner_id?: string;
}

export class WebhookPayloadDto {
  @IsString()
  eventType: string;

  @IsString()
  objectType: string;

  @IsString()
  objectId: string;

  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsOptional()
  propertyValue?: any;

  @IsString()
  changeSource: string;

  @IsNumber()
  occurredAt: number;

  @IsNumber()
  subscriptionId: number;

  @IsNumber()
  portalId: number;
}

export class SyncRequestDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  syncType?: 'contacts' | 'deals' | 'all';

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}