import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model, Types } from 'mongoose';
import { OrderStatus } from './enums/order-status.enum';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { GETOrderStatusDto } from './dto/get-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
  ) {}

  //  POST /orders
  async create(userId: string, dto: any) {
    const items = dto.items;

    if (!items || items.length === 0) {
      throw new BadRequestException('No items provided');
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // const orderData = {
    //   userId: new Types.ObjectId(userId),
    //   items,
    //   totalAmount,
    //   deliveryType: dto.deliveryType || 'SELF_PICKUP',
    // };
    return this.orderModel.create({
      userId,
      ...dto,
      totalAmount,
    });
  }

  //  GET /orders
  async findAll( query: GETOrderStatusDto) {
    const filter: any = { };
    if(query['active-order']){ 
      filter.status = { $nin: [OrderStatus.CANCELLED, OrderStatus.DELIVERED] };
    }
    else if (query.status) {
      filter.status = query.status;
    }

    if(query.userId){ 
      filter.userId = query.userId;
    }
    
    return this.orderModel
      .find({ ...filter })
      .sort({ createdAt: -1 });
  }

  //  GET /orders/:id
  async findById(userId: string, id: string) {
    const order = await this.orderModel.findOne({
      _id: id,
      userId,
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  //  PATCH /orders/:id/status
  async updateStatus(userId: string, id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findOne({
      _id: id
    });

    if (!order) throw new NotFoundException('Order not found');

    if (
      (order.status == OrderStatus.SHIPPED || order.status == OrderStatus.DELIVERED) && 
      (dto.status == OrderStatus.REJECTED || dto.status == OrderStatus.CANCELLED)  
    ) {
      throw new BadRequestException(`Cannot cancel/reject this order, it is already ${order.status?.toLowerCase()}`);
    }

    const { status, rejectionReason } = dto;
    const updateData: any = { 
      status,
      statusUpdatedBy: new Types.ObjectId(userId),
      statusUpdatedAt: new Date() 
    };
    if (status === OrderStatus.REJECTED) {
      updateData['rejectionReason'] = rejectionReason;
    }
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    return updatedOrder;
  }

  //  GET /orders/:id/tracking
  async getTracking(id: string) {
    const order = await this.orderModel.findById(id);

    if (!order) throw new NotFoundException('Order not found');

    return {
      status: order.status,
      trackingId: order.trackingId,
    };
  }
}