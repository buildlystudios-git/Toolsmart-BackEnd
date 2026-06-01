import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CategoryProductFilterDto {
    
      @ApiPropertyOptional({
        description: '{ "order": -1, "discountedItems": 1 }',
      })
      @IsOptional()
      @IsString()
      sortBy?: string;
}