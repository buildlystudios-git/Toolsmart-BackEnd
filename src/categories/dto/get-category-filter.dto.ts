import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CategoryFilterDto {
  @ApiPropertyOptional({example: "category-id"})
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  id?: string;

  @ApiPropertyOptional({example: "category-name"})
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;

  @ApiPropertyOptional({
      example: 1,
      description: 'level',
    })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  level?: number = 1;

  @ApiPropertyOptional({
    example: '{ "name": 1 }',
    description: '{ "name": 1 }',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;
}