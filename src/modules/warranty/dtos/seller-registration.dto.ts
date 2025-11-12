import { IsOptional, IsString } from 'class-validator';
export class SellerRegistrationDto {
  @IsOptional() @IsString() contactId?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() name?: string;
}
