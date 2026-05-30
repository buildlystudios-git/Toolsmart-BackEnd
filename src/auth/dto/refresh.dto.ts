import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ example: 'user_id_here' })
    @IsString()
    userId!: string;

  @ApiProperty({ example: 'refresh_token_here' })
    @IsString()
    refreshToken!: string;
}