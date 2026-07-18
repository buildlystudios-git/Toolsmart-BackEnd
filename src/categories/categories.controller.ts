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
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as csvParser from 'csv-parser';
import { Model } from 'mongoose';
import { Response } from 'express';
import { Readable } from 'stream';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CategoryFilterDto } from './dto/get-category-filter.dto';
import { CategoryProductFilterDto } from './dto/get-category-product.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(
    private readonly service: CategoriesService,
  ) {}

  // Create Category
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    this.logger.log(`Creating category with name: ${dto.name}`);
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: CategoryFilterDto) {
    this.logger.log(`Finding all categories with filters: ${JSON.stringify(query)}`);
    return this.service.findAll(query);
  }

  @Get(':id/products')
  getCategoryProducts(@Param('id') id: string, @Query() query: CategoryProductFilterDto) {
    this.logger.log(`Fetching products for category with ID: ${id} and filters: ${JSON.stringify(query)}`);
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

    /**
   * Bulk Upload Categories
   */
  @Post('bulk-upload')
  @ApiOperation({
    summary: 'Bulk upload categories using CSV',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Categories uploaded successfully',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, //10 MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.endsWith('.csv')) {
          return callback(
            new BadRequestException(
              'Only CSV files are allowed.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'CSV file is required.',
      );
    }

    return this.service.bulkUpload(
      req.user.userId,
      file,
    );
  }
}