import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsArray,
  IsBoolean
} from 'class-validator';

export class UpdateProductDto {
    @ApiProperty({ example: 'Drill Machine', required: true })
    @IsOptional()
    @IsString()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    name!: string;

    @ApiPropertyOptional({ example: 'High power drill' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Makita' })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiPropertyOptional({ example: '<p>This is a sample banner</p>' })
    @IsOptional()
    @IsString()
    banner?: string;

    @ApiProperty({ example: 2000, required: true  })
    @IsOptional()
    @IsNumber()
    mrp!: number;

    @ApiProperty({ example: 1500, required: true })
    @IsOptional()
    @IsNumber()
    price!: number;

    @ApiProperty({ example: 100, default: 100, required: true  })
    @IsOptional()
    @IsNumber()
    quantity!: number;

    @ApiPropertyOptional({
        example: 1,
    })
    order?: number;

    @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d', required: true  })
    @IsOptional()
    @IsMongoId()
    categoryId!: string;

    @ApiPropertyOptional({ example: ['img1.png', 'img2.png'] })
    @IsOptional()
    @IsArray()
    images?: string[];
}