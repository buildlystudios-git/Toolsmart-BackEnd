import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCouponDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ enum: ['flat', 'percentage'] })
  @IsOptional()
  @IsEnum(['flat', 'percentage'])
  type!: 'flat' | 'percentage';

  @ApiProperty({ example: 10 })
  @IsOptional()
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

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiry date in UTC (ISO 8601 format)',
  })
  @IsOptional()
  expiryDate?: Date;
}