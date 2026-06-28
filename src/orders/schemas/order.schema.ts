import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DeliveryType } from '../enums/delivery-type.enum';
import { OrderStatus } from '../enums/order-status.enum';

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId!: Types.ObjectId;

  @Prop()
  quantity!: number;

  @Prop()
  price!: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items!: OrderItem[];

  @Prop({ required: true })
  totalAmount!: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING_APPROVAL,
  })
  status!: OrderStatus;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  statusUpdatedBy?: Types.ObjectId;

  @Prop({
    default: null,
  })
  statusUpdatedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: null })
  trackingId?: string;

  @Prop({
    type: String,
    enum: DeliveryType,
    default: DeliveryType.SELF_PICKUP,
  })
  deliveryType!: DeliveryType;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ deliveryType: 1 });
OrderSchema.index({ createdAt: -1 });