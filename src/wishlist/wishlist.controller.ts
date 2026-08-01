import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import {
  AddToWishlistDto,
  MoveToCartDto,
  MoveMultipleToCartDto,
} from './dto/wishlist.dto';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  /**
   * GET /wishlist
   */
  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  getWishlist(@Req() req: any) {
    return this.service.getWishlistItems(req.user.sub);
  }

  /**
   * POST /wishlist
   */
  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  addToWishlist(
    @Req() req: any,
    @Body() dto: AddToWishlistDto,
  ) {
    return this.service.addToWishlist(
      req.user.sub,
      dto.productId,
    );
  }

  /**
   * DELETE /wishlist/clear
   */
  @Delete('clear')
  @ApiOperation({ summary: 'Clear wishlist' })
  clearWishlist(@Req() req: any) {
    return this.service.clearWishlist(req.user.sub);
  }

  /**
   * POST /wishlist/move-to-cart
   */
  @Post('move-to-cart')
  @ApiOperation({ summary: 'Move single item to cart with quantity' })
  moveToCart(
    @Req() req: any,
    @Body() dto: MoveToCartDto,
  ) {
    return this.service.moveToCart(
      req.user.sub,
      dto.productId,
      dto.quantity,
    );
  }

  /**
   * POST /wishlist/move-multiple
   */
  @Post('move-multiple')
  @ApiOperation({ summary: 'Move multiple wishlist items to cart' })
  moveMultiple(
    @Req() req: any,
    @Body() dto: MoveMultipleToCartDto,
  ) {
    return this.service.moveMultipleToCart(
      req.user.sub,
      dto.items,
    );
  }

  /**
   * POST /wishlist/:productId/move-to-cart (REST cleaner)
   */
  @Post('product/:productId/move-to-cart')
  @ApiOperation({ summary: 'Move item to cart via param (clean API)' })
  moveToCartByParam(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.service.moveToCart(
      req.user.sub,
      productId,
      body.quantity,
    );
  }

    /**
   * DELETE /wishlist/:productId
   */
  @Delete('product/:productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeFromWishlist(
    @Req() req: any,
    @Param('productId') productId: string,
  ) {
    return this.service.removeFromWishlist(
      req.user.sub,
      productId,
    );
  }
}