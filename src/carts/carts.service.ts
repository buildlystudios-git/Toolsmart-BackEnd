import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './schemas/cart.schema';
import { Model, Types } from 'mongoose';
import { Coupon } from '../coupons/schemas/coupon.schema';
import { Product } from 'src/products/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private cartModel: Model<Cart>,

    @InjectModel(Coupon.name)
    private couponModel: Model<Coupon>,

    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  /**
   * Common: Get or Create Cart
   */
  public async getCartOrCreate(userId: string) {
    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = await this.cartModel.create({ userId, items: [] });
    }

    return cart;
  }

  /**
   * Recalculate cart totals
   *
   * Called whenever:
   * - item added
   * - quantity updated
   * - item removed
   * - coupon applied
   * - coupon removed
   * - before checkout
   */
  async recalculateCart(cart: Cart): Promise<void> {
    await (cart as any).populate('items.productId');

    let total = 0;

    for (const item of cart.items as any[]) {
      const product = item.productId;

      if (!product) {
        continue;
      }

      if (product.isDeleted) {
        continue;
      }

      if (!product.isActive) {
        continue;
      }

      total += product.price * item.quantity;
    }

    cart.totalAmount = total;

    cart.discount = 0;
    cart.finalAmount = total;

    /**
     * No coupon
     */
    if (!cart.couponId) {
      return;
    }

    /**
     * Load coupon
     */
    const coupon = await this.couponModel.findById(cart.couponId);

    /**
     * Coupon deleted
     */
    if (!coupon) {
      cart.couponId = null;
      cart.couponCode = null;
      return;
    }

    /**
     * Inactive coupon
     */
    if (!coupon.isActive) {
      cart.couponId = null;
      cart.couponCode = null;
      return;
    }

    /**
     * Expired coupon
     */
    if (
      coupon.expiryDate &&
      coupon.expiryDate.getTime() < Date.now()
    ) {
      cart.couponId = null;
      cart.couponCode = null;
      return;
    }

    /**
     * Minimum order amount
     */
    if (
      coupon.minOrderAmount &&
      total < coupon.minOrderAmount
    ) {
      return;
    }

    let discount = 0;

    /**
     * Flat coupon
     */
    if (coupon.type === 'flat') {
      discount = coupon.value;
    }

    /**
     * Percentage coupon
     */
    if (coupon.type === 'percentage') {
      discount = (total * coupon.value) / 100;

      if (coupon.maxDiscount) {
        discount = Math.min(
          discount,
          coupon.maxDiscount,
        );
      }
    }

    /**
     * Discount should never exceed total
     */
    discount = Math.min(discount, total);

    cart.discount = Number(discount.toFixed(2));
    cart.finalAmount = Number((total - discount).toFixed(2));
  }
  

  /**
   * GET /cart
   */
  async getCart(userId: string) {
    const cart = await this.getCartOrCreate(userId);

    await this.recalculateCart(cart);
    await cart.save();

    return {
  message: 'Cart fetched successfully',
  cart: await cart.populate('items.productId'),
};
  }

  /**
   * POST /cart
   */
  async addToCart(userId: string, dto: any) {
    const { productId, quantity } = dto;

    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    const cart = await this.getCartOrCreate(userId);

    const item = cart.items.find(
      (i) => i.productId.toString() === productId,
    );

    if (item) {
      item.quantity += quantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(productId),
        quantity,
      });
    }

    await this.recalculateCart(cart);
    await cart.save();

    return {
      message: 'Item added to cart successfully',
      cart: await cart.populate('items.productId'),
    };
  }

  /**
   * PATCH /cart/:productId
   */
  async updateCart(userId: string, productId: string, quantity: number) {
    const cart = await this.getCartOrCreate(userId);

    const item = cart.items.find(
      (i) => i.productId.toString() === productId,
    );

    if (!item) throw new NotFoundException('Product not in cart');

    item.quantity = quantity;

    await this.recalculateCart(cart);
    await cart.save();
    return {
      message: 'Cart updated successfully',
      cart: await cart.populate('items.productId'),
    };
  }

  /**
   * DELETE /cart/:productId
   */
  async removeItem(userId: string, productId: string) {
    const cart = await this.getCartOrCreate(userId);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Product not found in cart');
    }

    cart.items.splice(itemIndex, 1);

    await this.recalculateCart(cart);
    await cart.save();

    return {
      message: 'Item removed from cart successfully',
      cart: await cart.populate('items.productId'),
    };
  }

  /**
   * DELETE /cart/clear
   */
  async clearCart(userId: string) {
    const cart = await this.getCartOrCreate(userId);

    cart.items = [];

    cart.couponId = null;
    cart.couponCode = null;

    cart.discount = 0;
    cart.totalAmount = 0;
    cart.finalAmount = 0;

    await cart.save();

    return {
      message: 'Cart cleared successfully',
      cart: await cart.populate('items.productId'),
    };
  }

  /**
   * Apply Coupon
   */
  async applyCoupon(userId: string, code: string) {
    const cart = await this.getCartOrCreate(userId);

    if (!cart.items.length) {
      throw new BadRequestException(
        'Cannot apply coupon to an empty cart',
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    const coupon = await this.couponModel.findOne({
      code: normalizedCode,
      isActive: true,
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon');
    }

    if (
      coupon.expiryDate &&
      coupon.expiryDate.getTime() < Date.now()
    ) {
      throw new BadRequestException('Coupon has expired');
    }

    cart.couponId = coupon._id as Types.ObjectId;
    cart.couponCode = coupon.code;

    await this.recalculateCart(cart);
    await cart.save();

    return { 
      message: 'Coupon applied successfully', 
      cart: await cart.populate('items.productId') 
    };
  }

  /**
   * Remove Coupon
   */
  async removeCoupon(userId: string) {
    const cart = await this.getCartOrCreate(userId);

    if (!cart.couponId) {
      throw new BadRequestException(
        'No coupon applied to cart',
      );
    }

    cart.couponId = null;
    cart.couponCode = null;

    await this.recalculateCart(cart);
    await cart.save();

    return { 
      message: 'Coupon removed successfully', 
      cart: await cart.populate('items.productId') 
    };
  }
}