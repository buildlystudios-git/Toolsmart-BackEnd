import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '../schemas/approval.schema';

export class UpdateStatusDto {
  @ApiProperty({ enum: ApprovalStatus })
  @IsEnum(ApprovalStatus)
  status!: ApprovalStatus;

  @ApiPropertyOptional({ example: 'Invalid documents' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}