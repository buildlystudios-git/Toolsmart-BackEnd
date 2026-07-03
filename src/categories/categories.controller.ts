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
  Logger,
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
    private readonly logger = new Logger(CategoriesController.name)
    
  ) {}

  // Create Category
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    this.logger.log(`log==========Creating category with name: ${dto.name}`);
    this.logger.debug(`debug==========Category DTO: ${JSON.stringify(dto)}`);
    this.logger.error(`error==========Creating category with name: ${dto.name}`);
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: CategoryFilterDto) {
    this.logger.log(`Finding all categories`);
    return this.service.findAll(query);
  }

  @Get(':id/products')
  getCategoryProducts(@Param('id') id: string, @Query() query: CategoryProductFilterDto) {
    this.logger.log(`Fetching products for category with ID: ${id}`);
    return this.service.getCategoryProducts(id, query);
  }

  // Update Category
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    this.logger.log(`Updating category with ID: ${id}`);
    return this.service.update(id, dto);
  }

  // Delete Category
  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`Deleting category with ID: ${id}`);
    return this.service.delete(id);
  }
}