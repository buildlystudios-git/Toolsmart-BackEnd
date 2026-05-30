import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateToCartDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}