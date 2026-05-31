import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './carts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateToCartDto } from './dto/update-to-cart.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly service: CartService) {}

  //  GET /cart
  @Get()
  getCart(@Req() req: any) {
    return this.service.getCart(req.user.sub);
  }

  //  POST /cart
  @Post()
  addToCart(@Req() req: any, @Body() dto: AddToCartDto) {

    return this.service.addToCart(req.user.sub, dto);
  }

  //  PATCH /cart/:productId
  @Patch(':productId')
  updateCart(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() dto: UpdateToCartDto
  ) {
    return this.service.updateCart(
      req.user.sub,
      productId,
      dto.quantity,
    );
  }

    //  DELETE /cart/clear
  @Delete('clear')
  clearCart(@Req() req: any) {
    return this.service.clearCart(req.user.sub);
  }

  //  DELETE /cart/:productId
  @Delete(':productId')
  removeItem(
    @Req() req: any,
    @Param('productId') productId: string,
  ) {
    return this.service.removeItem(
      req.user.sub,
      productId,
    );
  }

  // POST /cart/apply-coupon
  @Post('apply-coupon')
  applyCoupon(
    @Req() req: any,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.service.applyCoupon(
      req.user.sub,
      dto.code,
    );
  }

  @Delete('remove-coupon')
  removeCoupon(@Req() req: any) {
    return this.service.removeCoupon(req.user.sub);
  }
}