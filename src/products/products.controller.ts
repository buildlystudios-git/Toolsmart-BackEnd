import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ProductFilterDto } from './dto/get-product-filter.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly service: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    this.logger.log(`Creating product with name: ${dto.name}`);
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: ProductFilterDto) {
    this.logger.log(`Finding all products with filters: ${JSON.stringify(query)}`);
    return this.service.findAll(query);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateProductDto })
  //@ApiExtraModels(UpdateProductDto)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    this.logger.log(`Updating product with ID: ${id}`);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`Deleting product with ID: ${id}`);
    return this.service.delete(id);
  }
}