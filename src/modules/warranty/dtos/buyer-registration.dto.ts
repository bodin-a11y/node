import { IsOptional, IsString } from 'class-validator';
export class BuyerRegistrationDto {
  @IsOptional() @IsString() contactId?: string;   // если уже есть контакт
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() name?: string;
}
