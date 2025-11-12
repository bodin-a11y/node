import { IsString, IsOptional } from 'class-validator';
export class ActivateWarrantyDto {
  @IsString() qr!: string;
  @IsOptional() @IsString() buyerContactId?: string;
}
