import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoryFilterDto } from './dto/get-category-filter.dto';
import { CategoryProductFilterDto } from './dto/get-category-product.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly service: CategoriesService,
    
  ) {}

  // Create Category
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: CategoryFilterDto) {
    return this.service.findAll(query);
  }

  @Get(':id/products')
  getCategoryProducts(@Param('id') id: string, @Query() query: CategoryProductFilterDto) {
    return this.service.getCategoryProducts(id, query);
  }

  // Update Category
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  // Delete Category
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}