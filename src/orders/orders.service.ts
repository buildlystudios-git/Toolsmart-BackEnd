import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Connection, Model, Types } from 'mongoose';
import { OrderStatus } from './enums/order-status.enum';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { GETOrderStatusDto } from './dto/get-order.dto';
import { NotificationService } from '../notification/notification.service';
import { Product } from 'src/products/schemas/product.schema';
import { Coupon } from 'src/coupons/schemas/coupon.schema';
import { CartService } from 'src/carts/carts.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {

  private readonly logger = new Logger(OrdersService.name);
  
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<Order>,

    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,

    @InjectModel(Coupon.name)
    private readonly couponModel: Model<Coupon>,

    @InjectConnection()
    private readonly connection: Connection,

    private readonly cartService: CartService,

    private notificationService: NotificationService,
  ) {}

  //  POST /orders
  // async create(userId: string, dto: any) {
  //   // const items = dto.items;

  //   // if (!items || items.length === 0) {
  //   //   throw new BadRequestException('No items provided');
  //   // }

  //   // const totalAmount = items.reduce(
  //   //   (sum, item) => sum + item.price * item.quantity,
  //   //   0,
  //   // );

  //   // return this.orderModel.create({
  //   //   userId,
  //   //   ...dto,
  //   //   totalAmount,
  //   // });


    
  // }

  async create(
    userId: string,
    dto: CreateOrderDto,
  ) {
    // const session = await this.connection.startSession();

    // session.startTransaction();

    try {

      /**
       * Get Cart
       */
      const cart = await this.cartService.getCartOrCreate(userId);

      if (!cart.items.length) {
        throw new BadRequestException('Cart is empty');
      }

      /**
       * Recalculate latest prices & coupon
       */
      await this.cartService.recalculateCart(cart);

      /**
       * Load latest products
       */
      const productIds = cart.items.map(i => i.productId);

      const products = await this.productModel.find({
        _id: { $in: productIds },
        //isDeleted: false,
        isActive: true,
      });

      const orderItems: any[] = [];

      /**
       * Validate products
       */
      for (const cartItem of cart.items) {

        // const product = products.find(
        //   p => p._id.toString() === cartItem.productId.toString(),
        // );
        const product = products.find((p) => {
          
          const productId =
            cartItem.productId instanceof Types.ObjectId
              ? cartItem.productId
              //@ts-ignore
              : cartItem.productId._id;

          return p._id.equals(productId);
        });

        if (!product) {
          throw new BadRequestException(
            `Product not found.`,
          );
        }

        if (product.quantity < cartItem.quantity) {
          throw new BadRequestException(
            `${product.name} has only ${product.quantity} quantity available.`,
          );
        }

        orderItems.push({
          productId: product._id,
          quantity: cartItem.quantity,
          price: product.price,
        });
      }

      /**
       * Generate Order Number
       */
      const orderNumber =
        `ORD-${Date.now()}`;

      /**
       * Create Order
       */
      const order = await this.orderModel.create(
        [
          {
            orderNumber,

            userId,

            items: orderItems,

            totalAmount: cart.totalAmount,

            discountAmount: cart.discount,

            grandTotal: cart.finalAmount,

            couponId: cart.couponId,

            couponCode: cart.couponCode,

            deliveryType: dto.deliveryType,

            phoneNumber: dto.phoneNumber,

            address: dto.address,
          },
        ],
        //{ session },
      );

      /**
       * Reduce Stock
       */
      for (const item of orderItems) {

        await this.productModel.updateOne(
          {
            _id: item.productId,
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          // {
          //   session,
          // },
        );
      }

      /**
       * Increment Coupon Usage
       */
      if (cart.couponId) {

        await this.couponModel.updateOne(
          {
            _id: cart.couponId,
          },
          {
            $inc: {
              usedCount: 1,
            },
          },
          // {
          //   session,
          // },
        );
      }

      /**
       * Clear Cart
       */
      cart.items = [];
      cart.couponId = null;
      cart.couponCode = null;
      cart.discount = 0;
      cart.totalAmount = 0;
      cart.finalAmount = 0;

      await cart.save();
      //await cart.save({ session });


      //await session.commitTransaction();

      /**
       * Fire & Forget Notification
       */
      void this.notificationService
        .sendOrderStatusNotification(order[0])
        .catch(console.error);

      return {
        message: 'Order placed successfully',
        order: order[0],
      };

    } catch (error) {
      this.logger.error('Error occurred while placing order:', error);

      // await session.abortTransaction();

      throw error;

    } 
    // finally {
    //   this.logger.error('Finally block---Error occurred while placing order');
    //   //await session.endSession();

    // }
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

    const provider = process.env.CB_PUSH_NOTIFICATION ?? 'false';
    if (provider !== 'true' && updatedOrder) {
      void this.notificationService
        .sendOrderStatusNotification(updatedOrder)
        .catch((error) => {
          this.logger.error(
            `Notification failed for order ${updatedOrder._id}`,
            error.stack,
          );
        });
      //await this.notificationService.sendOrderStatusNotification(updatedOrder);
    }
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