import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class PhoneNumberDto {
  @ApiProperty({ example: '9876543210' })
    @IsString()
    @Length(10, 10)
    phoneNumber!: string;
}