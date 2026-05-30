import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateApprovalDto {
  @ApiProperty({ example: 'New Vendor Approval' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Requesting approval for vendor onboarding' })
  @IsOptional()
  @IsString()
  description?: string;
}