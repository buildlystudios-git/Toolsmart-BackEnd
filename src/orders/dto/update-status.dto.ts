import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'shipped',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
  })
  @IsString()
  status!: string;
}