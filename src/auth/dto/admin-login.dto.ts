import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class AdminLoginDto {
    @ApiProperty({ example: 'xxxxxxx@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: 'xxxxxxx' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    password!: string;
}