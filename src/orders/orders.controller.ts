import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  //  POST /orders
  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.service.create(req.user.sub, dto);
  }

  //  GET /orders
  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.sub);
  }

  //  GET /orders/:id
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findById(req.user.sub, id);
  }

  //  PATCH /orders/:id/status
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }

  //  GET /orders/:id/tracking
  @Get(':id/tracking')
  getTracking(@Param('id') id: string) {
    return this.service.getTracking(id);
  }

  //  POST /orders/:id/cancel
  @Post(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.service.cancelOrder(req.user.sub, id);
  }
}