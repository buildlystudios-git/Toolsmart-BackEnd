import {
  Controller,
  Post,
  Patch,
  Query,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponFilterDto } from './dto/get-coupon-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
@UseGuards(JwtAuthGuard)
//@Roles('admin')
export class CouponsController {

  private readonly logger = new Logger(CouponsController.name);
  constructor(private readonly service: CouponsService) {}

  //  CREATE
  @Post()
  create(@Body() dto: CreateCouponDto) {
    this.logger.log(`Creating coupon with code: ${dto.code}`);
    return this.service.create(dto);
  }

  //  UPDATE
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    this.logger.log(`Updating coupon with ID: ${id}`);
    return this.service.update(id, dto);
  }

  //  DELETE
  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`Deleting coupon with ID: ${id}`);
    return this.service.delete(id);
  }

  // OPTIONAL
  @Get()
  findAll(@Query() query: CouponFilterDto) {
    this.logger.log(`Finding all coupons with filters: ${JSON.stringify(query)}`);
    return this.service.findAll(query);
  }
}