import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: ['flat', 'percentage'] })
  @IsEnum(['flat', 'percentage'])
  type!: 'flat' | 'percentage';

  @ApiProperty({ example: 10 })
  @IsNumber()
  value!: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  expiryDate?: Date;
}