import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Length(10, 10)
  phoneNumber!: string;
}

export class OtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Length(10, 10)
  phoneNumber!: string;

  @ApiProperty({ example: '1234', required: false })
  @IsOptional()
  @IsString()
  otp?: string;
}