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
  private async getCartOrCreate(userId: string) {
    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = await this.cartModel.create({ userId, items: [] });
    }

    return cart;
  }

  /**
   * Core: Recalculate Cart
   */
  private async recalculateCart(cart: any) {
    await cart.populate('items.productId');

    const total = cart.items.reduce((sum, item: any) => {
      const price = item.productId?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);

    cart.totalAmount = total;

    if (cart.couponCode) {
      const coupon = await this.couponModel.findOne({
        code: cart.couponCode,
        isActive: true,
      });

      if (!coupon) {
        cart.couponCode = null;
        cart.discount = 0;
        cart.finalAmount = total;
        return;
      }

      // Check Expiry
      if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        cart.couponCode = null;
        cart.discount = 0;
        cart.finalAmount = total;
        return;
      }

      if (coupon.minOrderAmount && total < coupon.minOrderAmount) {
        cart.discount = 0;
        cart.finalAmount = total;
        return;
      }

      let discount = 0;

      if (coupon.type === 'flat') {
        discount = coupon.value;
      } else {
        discount = (total * coupon.value) / 100;

        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      }

      cart.discount = discount;
      cart.finalAmount = total - discount;
    } else {
      cart.discount = 0;
      cart.finalAmount = total;
    }
  }

  /**
   * GET /cart
   */
  async getCart(userId: string) {
    const cart = await this.getCartOrCreate(userId);

    await this.recalculateCart(cart);
    await cart.save();

    return cart.populate('items.productId');
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

    return cart.populate('items.productId');
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
    return cart.save();
  }

  /**
   * DELETE /cart/:productId
   */
  async removeItem(userId: string, productId: string) {
    const cart = await this.getCartOrCreate(userId);

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId,
    );

    await this.recalculateCart(cart);
    return cart.save();
  }

  /**
   * DELETE /cart/clear
   */
  async clearCart(userId: string) {
    const cart = await this.getCartOrCreate(userId);

    cart.items = [];
    cart.couponCode = null;
    cart.discount = 0;
    cart.totalAmount = 0;
    cart.finalAmount = 0;

    return cart.save();
  }

  /**
   * Apply Coupon
   */
  async applyCoupon(userId: string, code: string) {
    const cart = await this.getCartOrCreate(userId);

    const coupon = await this.couponModel.findOne({
      code,
      isActive: true,
    });

    if (!coupon) throw new BadRequestException('Invalid coupon');

    cart.couponCode = code;

    await this.recalculateCart(cart);
    return cart.save();
  }

  /**
   * Remove Coupon
   */
  async removeCoupon(userId: string) {
    const cart = await this.getCartOrCreate(userId);

    cart.couponCode = null;

    await this.recalculateCart(cart);
    return cart.save();
  }
}