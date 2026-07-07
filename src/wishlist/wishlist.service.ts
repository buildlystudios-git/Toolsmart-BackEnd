import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wishlist } from './schemas/wishlist.schema';
import { Model, Types } from 'mongoose';
import { CartService } from '../carts/carts.service';
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private wishlistModel: Model<Wishlist>,

    @InjectModel(Product.name)
    private productModel: Model<Product>,

    private cartService: CartService,
  ) {}

  /**
   * Get or Create Wishlist
   */
  private async getWishlist(userId: string) {
    let wishlist = await this.wishlistModel.findOne({ userId });

    if (!wishlist) {
      wishlist = await this.wishlistModel.create({
        userId,
        products: [],
      });
    }

    return wishlist;
  }

  /**
   * GET /wishlist
   */
  async getWishlistItems(userId: string) {
    const wishlist = await this.getWishlist(userId);
    return wishlist.populate('products');
  }

  /**
   * Add to Wishlist
   */
  async addToWishlist(userId: string, productId: string) {
    // Validate product exists
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Prevent duplicates using $addToSet
    await this.wishlistModel.updateOne(
      { userId },
      {
        $setOnInsert: { userId },
        $addToSet: { products: new Types.ObjectId(productId) },
      },
      { upsert: true },
    );

    return { message: 'Added to wishlist' };
  }

  /**
   * Remove from Wishlist
   */
  async removeFromWishlist(userId: string, productId: string) {
    const result = await this.wishlistModel.updateOne(
      { userId },
      { $pull: { products: new Types.ObjectId(productId) } },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('Product not in wishlist');
    }

    return { message: 'Removed from wishlist' };
  }

  /**
   * Clear Wishlist
   */
  async clearWishlist(userId: string) {
    await this.wishlistModel.updateOne(
      { userId },
      { $set: { products: [] } },
      { upsert: true },
    );

    return { message: 'Wishlist cleared' };
  }

  /**
   * Move Single Item to Cart (with quantity)
   */
  async moveToCart(
    userId: string,
    productId: string,
    quantity: number,
  ) {
    // Validate product
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    // Optional: quantity check
    if (product.quantity && quantity > product.quantity) {
      throw new BadRequestException('Not enough quantity');
    }

    const wishlist = await this.getWishlist(userId);

    const exists = wishlist.products.some(
      (p) => p.toString() === productId,
    );

    if (!exists) {
      throw new NotFoundException('Product not in wishlist');
    }

    // Add to cart
    await this.cartService.addToCart(userId, {
      productId,
      quantity,
    });

    // Remove from wishlist
    await this.wishlistModel.updateOne(
      { userId },
      { $pull: { products: new Types.ObjectId(productId) } },
    );

    return {
      message: 'Item moved to cart successfully',
    };
  }

  /**
   * Move Multiple Items to Cart
   */
  async moveMultipleToCart(
    userId: string,
    items: { productId: string; quantity: number }[],
  ) {
    if (!items.length) {
      throw new BadRequestException('No items provided');
    }

    const wishlist = await this.getWishlist(userId);

    const wishlistSet = new Set(
      wishlist.products.map((p) => p.toString()),
    );

    const movePromises = [];
    const productIdsToRemove: Types.ObjectId[] = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!wishlistSet.has(productId)) continue;

      const product = await this.productModel.findById(productId);
      if (!product) continue;

      if (quantity < 1) continue;

        const movePromises: Promise<any>[] = [];

        for (const item of items) {
            const { productId, quantity } = item;

            movePromises.push(
                this.cartService.addToCart(userId, {
                    productId,
                    quantity,
                }),
            );
        }
      productIdsToRemove.push(new Types.ObjectId(productId));
    }

    // Execute all cart updates
    await Promise.all(movePromises);

    // Remove all moved items from wishlist
    if (productIdsToRemove.length) {
      await this.wishlistModel.updateOne(
        { userId },
        { $pull: { products: { $in: productIdsToRemove } } },
      );
    }

    return {
      message: 'Items moved to cart successfully',
    };
  }

  /**
   * Check if product is wishlisted
   */
  async isWishlisted(userId: string, productId: string) {
    const wishlist = await this.wishlistModel.findOne({
      userId,
      products: new Types.ObjectId(productId),
    });

    return !!wishlist;
  }
}