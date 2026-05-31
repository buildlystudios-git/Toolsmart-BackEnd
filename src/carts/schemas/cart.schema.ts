import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ type: Number, default: 1, min: 1 })
  quantity!: number;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ type: [CartItem], default: [] })
  items!: CartItem[];

  // Coupon Info
  @Prop({ type: String, default: null })
  couponCode?: string | null;

  @Prop({ type: Number, default: 0 })
  discount?: number;

  // Pricing
  @Prop({ type: Number, default: 0 })
  totalAmount?: number;

  @Prop({ type: Number, default: 0 })
  finalAmount?: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Fast lookup by user
CartSchema.index({ userId: 1 });

// Optional: query carts with coupons
CartSchema.index({ couponCode: 1 });

// Sorting / analytics
CartSchema.index({ createdAt: -1 });