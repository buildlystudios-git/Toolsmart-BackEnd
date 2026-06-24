import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DeliveryType } from '../enums/delivery-type.enum';

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
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status!: string;

  @Prop({ default: null })
  trackingId?: string;

  @Prop({
    type: String,
    enum: DeliveryType,
    default: DeliveryType.SELF_PICKUP,
  })
  deliveryType!: DeliveryType;

  @Prop({ default: false })
  isCancelled?: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ deliveryType: 1 });
OrderSchema.index({ createdAt: -1 });