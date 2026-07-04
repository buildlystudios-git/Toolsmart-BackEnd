import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  Logger,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GETOrderStatusDto } from './dto/get-order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly service: OrdersService) {}

  //  POST /orders
  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    this.logger.log(`Creating order for user`);
    return this.service.create(req.user.sub, dto);
  }

  //  GET /orders
  @Get()
  findAll(@Req() req: any, @Query() query: GETOrderStatusDto) {
    this.logger.log(`Finding all orders with filters: ${JSON.stringify(query)}`);
    return this.service.findAll( query);
  }

  //  GET /orders/:id
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    this.logger.log(`Finding order with ID: ${id}`);
    return this.service.findById(req.user.sub, id);
  }

  //  PATCH /orders/:id/status
  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    this.logger.log(`Updating status of order with ID: ${id} to ${dto.status}`);
    return this.service.updateStatus(req.user.sub,id, dto);
  }

  //  GET /orders/:id/tracking
  @Get(':id/tracking')
  getTracking(@Param('id') id: string) {
    this.logger.log(`Getting tracking information for order with ID: ${id}`);
    return this.service.getTracking(id);
  }
}