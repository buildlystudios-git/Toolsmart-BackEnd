import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { Transform } from 'class-transformer';

export class GETOrderStatusDto {
  @ApiProperty({ example: OrderStatus.APPROVED, enum: OrderStatus, default: OrderStatus.APPROVED, required:false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: string;

  @ApiPropertyOptional({example: "true/false"})
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  'active-order'?: string;
}