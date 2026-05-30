import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model, Types } from 'mongoose';

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

    return this.orderModel.create({
      userId,
      items,
      totalAmount,
    });
  }

  //  GET /orders
  async findAll(userId: string) {
    return this.orderModel
      .find({ userId })
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
  async updateStatus(id: string, status: string) {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!order) throw new NotFoundException('Order not found');

    return order;
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

  //  POST /orders/:id/cancel
  async cancelOrder(userId: string, id: string) {
    const order = await this.orderModel.findOne({
      _id: id,
      userId,
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.status === 'shipped' || order.status === 'delivered') {
      throw new BadRequestException(`Cannot cancel this order, it is already ${order.status}`);
    }

    order.status = 'cancelled';
    order.isCancelled = true;

    return order.save();
  }
}