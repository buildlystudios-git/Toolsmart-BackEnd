import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Coupon {

  @Prop({ unique: true })
  code!: string;

  @Prop({ enum: ['flat', 'percentage'], required: true })
  type!: 'flat' | 'percentage';

  @Prop({ required: true })
  value!: number;

  @Prop({ default: 0 })
  minOrderAmount?: number;

  @Prop()
  maxDiscount?: number;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop()
  expiryDate?: Date;

  // Number of times this coupon has been used
  @Prop({ default: 0 })
  usedCount!: number;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

export type CouponDocument = HydratedDocument<Coupon>;