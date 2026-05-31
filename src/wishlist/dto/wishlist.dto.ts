import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, Min, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Add to Wishlist
 */
export class AddToWishlistDto {
  @ApiProperty({ example: '64f1c2a8b5d6e7f123456789' })
  @IsMongoId()
  productId!: string;
}

/**
 * Remove from Wishlist
 */
export class RemoveFromWishlistDto {
  @ApiProperty({ example: '64f1c2a8b5d6e7f123456789' })
  @IsMongoId()
  productId!: string;
}

/**
 * Move Single Item to Cart (with quantity)
 */
export class MoveToCartDto {
  @ApiProperty({ example: '64f1c2a8b5d6e7f123456789' })
  @IsMongoId()
  productId!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

/**
 * Bulk Move Item DTO
 */
export class MoveItemDto {
  @ApiProperty({ example: '64f1c2a8b5d6e7f123456789' })
  @IsMongoId()
  productId!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

/**
 * Move Multiple Items to Cart
 */
export class MoveMultipleToCartDto {
  @ApiProperty({
    type: [MoveItemDto],
    example: [
      { productId: '64f1c2a8b5d6e7f123456789', quantity: 2 },
      { productId: '64f1c2a8b5d6e7f123456790', quantity: 1 },
    ],
  })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MoveItemDto)
  items!: MoveItemDto[];
}