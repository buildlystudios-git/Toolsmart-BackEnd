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
  constructor(private readonly service: CouponsService) {}

  //  CREATE
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.service.create(dto);
  }

  //  UPDATE
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.service.update(id, dto);
  }

  //  DELETE
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // OPTIONAL
  @Get()
  findAll(@Query() query: CouponFilterDto) {
    return this.service.findAll(query);
  }
}