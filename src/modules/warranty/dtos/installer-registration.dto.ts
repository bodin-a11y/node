import { IsOptional, IsString } from 'class-validator';
export class InstallerRegistrationDto {
  @IsOptional() @IsString() contactId?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() name?: string;
}
