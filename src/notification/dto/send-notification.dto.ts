import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendNotificationDto {

  @ApiProperty({ example: 10 })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: "Notification Title" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: "Notification Body" })
  @IsString()
  @IsNotEmpty()
  body!: string;
}