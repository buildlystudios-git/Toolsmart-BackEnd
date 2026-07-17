import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { TermsDocumentType } from '../enums/terms.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTermsDto {

  @ApiProperty({ example: TermsDocumentType.TERMS_AND_CONDITIONS, required: true })
  @IsEnum(TermsDocumentType)
  type!: TermsDocumentType;

  @ApiProperty({ example: 'Terms and Conditions', required: true })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'These are the terms and conditions for using our services.', required: true })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ example: '1.0.0', required: false })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}