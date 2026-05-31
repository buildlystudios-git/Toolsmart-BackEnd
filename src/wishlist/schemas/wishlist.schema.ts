import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Wishlist {

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop([
    {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  ])
  products!: Types.ObjectId[];
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// Prevent duplicates
WishlistSchema.index({ userId: 1, products: 1 });