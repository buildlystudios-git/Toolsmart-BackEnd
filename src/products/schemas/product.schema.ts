import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product {

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop()
    about?: string;

    @Prop()
    brand?: string;

    @Prop()
    banner?: string;

    @Prop({ required: true })
    price!: number;

    @Prop({ required: true })
    mrp!: number;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId!: Types.ObjectId;

    @Prop([String])
    images?: string[];

    @Prop({ required: true, default: 0 })
    quantity!: number;

    // For sorting in UI
    @Prop({ default: 0 })
    order?: number;

    @Prop({ default: true })
    isActive?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

//   Indexes
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ categoryId: 1, name: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

export type ProductDocument = HydratedDocument<Product>;