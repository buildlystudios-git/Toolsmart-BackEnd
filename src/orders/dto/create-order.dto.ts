import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, ValidateNested, IsNumber, Min, IsEnum  } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType } from '../enums/delivery-type.enum';

export class OrderItemDto {
  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d' })
  @IsMongoId()
  productId!: string;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
 
  @ApiProperty({ example: DeliveryType.SELF_PICKUP, enum: DeliveryType, default: DeliveryType.SELF_PICKUP })
  @IsEnum(DeliveryType)
  deliveryType!: DeliveryType;
  
}