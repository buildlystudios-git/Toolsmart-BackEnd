import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  
  @ApiProperty({
    example: 'Power Tools',
    description: 'Name of the category',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

  @ApiPropertyOptional({
    example: 'Tools powered by electricity',
    description: 'Category description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'power-tools',
    description: 'SEO friendly unique key',
  })
  @IsOptional()
  @IsString()
  urlKey?: string;

  @ApiPropertyOptional({ example: '<p>This is a sample banner</p>' })
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.png',
    description: 'Category image URL',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'Parent category ID',
  })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Level in hierarchy (0 = root)',
  })
  @IsOptional()
  @IsNumber()
  level?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Sorting order for UI',
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Is category active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}