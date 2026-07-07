import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeviceType } from '../enums/device-type.enum';

export class CreateUserDeviceDto {
  @ApiProperty({
    example: 'fcm_token_xxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'Firebase Cloud Messaging device token',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    enum: DeviceType,
    example: DeviceType.ANDROID,
    description: 'Device platform',
  })
  @IsEnum(DeviceType)
  deviceType!: DeviceType;

  @ApiPropertyOptional({
    example: 'Samsung Galaxy S24',
    description: 'Device model/name',
  })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({
    example: '1.0.0',
    description: 'Application version',
  })
  @IsOptional()
  @IsString()
  appVersion?: string;
}