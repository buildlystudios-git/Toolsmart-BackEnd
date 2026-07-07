import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, ValidateNested, IsNumber, Min, IsEnum, IsOptional, IsString, IsObject  } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType } from '../enums/delivery-type.enum';

export class OrderAddressDto {
  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  addressLine!: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '400001' })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({ example: 'Near the station' })
  @IsOptional()
  @IsString()
  landmark?: string;
}

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
 
  @ApiProperty({ 
    example: DeliveryType.SELF_PICKUP, 
    enum: DeliveryType, 
    default: DeliveryType.SELF_PICKUP,
    description: 'The type of delivery for the order. Can be either SELF_PICKUP or DELIVERY.'
  })
  @IsEnum(DeliveryType)
  deliveryType!: DeliveryType;

  @ApiProperty({ example: '9606191317' })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({ type: OrderAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => OrderAddressDto)
  address!: OrderAddressDto;
}

