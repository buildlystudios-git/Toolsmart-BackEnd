import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
} from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export class RegisterDto {
  @ApiProperty({ example: 'XYZ' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '+91 11 1111 1111' })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({ example: 'anil@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.EMPLOYEE })
  @IsEnum(UserRole)
  role!: UserRole;
}