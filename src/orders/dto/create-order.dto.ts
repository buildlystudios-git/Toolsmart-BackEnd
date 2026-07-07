import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidateNested, IsEnum, IsOptional, IsString, IsObject  } from 'class-validator';
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

export class CreateOrderDto {
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

