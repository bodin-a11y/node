import { IsIn, IsString } from 'class-validator';
export class UpdateWarrantyDto {
  @IsString() id!: string;
  @IsIn(['active', 'expired']) status!: 'active' | 'expired';
}
