import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './schemas/cart.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private cartModel: Model<Cart>,
  ) {}

  //  GET /cart
  async getCart(userId: string) {
    const cartResponse = await this.cartModel
      .findOne({ userId })
      .populate('items.productId');

    if (!cartResponse) {
      const newCart = await this.cartModel.create({ userId, items: [] });
      return newCart.populate('items.productId');
    }  

    return cartResponse;
  }

  //  POST /cart (add item)
  async addToCart(userId: string, dto: any) {
    const { productId, quantity } = dto;

    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = await this.cartModel.create({
        userId,
        items: [{ productId, quantity }],
      });
      return cart;
    }

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

    return cart.save();
  }

  //  PATCH /cart/:productId
  async updateCart(userId: string, productId: string, quantity: number) {
    const cart = await this.cartModel.findOne({ userId });

    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find(
      (i) => i.productId.toString() === productId,
    );

    if (!item) throw new NotFoundException('Product not in cart');

    item.quantity = quantity;

    return cart.save();
  }

  //  DELETE /cart/:productId
  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ userId });

    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId,
    );

    return cart.save();
  }

  //  DELETE /cart/clear
  async clearCart(userId: string) {
    const cart = await this.cartModel.findOneAndUpdate(
      { userId },
      { items: [] },
      { returnDocument: 'after' }
    );
    console.log('Cart cleared:', cart);
    return cart;
  }
}