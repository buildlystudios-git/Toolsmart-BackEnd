import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {

  @ApiPropertyOptional({
    example: 'Updated Category Name',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'updated-url-key',
  })
  urlKey?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
  })
  description?: string;

  @ApiPropertyOptional({ example: '<p>This is a sample banner</p>' })
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/new-image.png',
  })
  image?: string;

  @ApiPropertyOptional({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
  })
  parentId?: string;

  @ApiPropertyOptional({
    example: 2,
  })
  level?: number;

  @ApiPropertyOptional({
    example: 1,
  })
  order?: number;

  @ApiPropertyOptional({
    example: false,
  })
  isActive?: boolean;
}