import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UnregisterDeviceDto {
  @ApiProperty({
    example: 'fcm_token_xyz',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}