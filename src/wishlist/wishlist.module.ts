import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';

import { Wishlist, WishlistSchema } from './schemas/wishlist.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Cart, CartSchema } from '../carts/schemas/cart.schema';
import { Coupon, CouponSchema } from '../coupons/schemas/coupon.schema';

import { CartService } from '../carts/carts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Product.name, schema: ProductSchema },

      { name: Cart.name, schema: CartSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
  ],
  controllers: [WishlistController],
  providers: [
    WishlistService,
    CartService,
  ],
  exports: [WishlistService],
})
export class WishlistModule {}