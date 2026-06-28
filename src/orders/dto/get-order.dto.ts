import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { Transform } from 'class-transformer';

export class GETOrderStatusDto {
  @ApiProperty({ example: OrderStatus.APPROVED, enum: OrderStatus, default: OrderStatus.APPROVED, required:false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: string;


  @ApiPropertyOptional({example: "6a1bcc48522d0cdc2aa165c3"})
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  userId?: string;
}