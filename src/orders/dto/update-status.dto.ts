import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {

  @ApiProperty({ example: OrderStatus.PROCESSING, enum: OrderStatus, default: OrderStatus.PROCESSING })
  @IsEnum(OrderStatus)
  status!: string;

  @ApiPropertyOptional({
    example: 'Product is out of stock'
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
 
}