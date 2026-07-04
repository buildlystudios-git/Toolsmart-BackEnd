import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Category {

    @Prop({ required: true})
    name!: string;

    @Prop()
    description?: string;

    @Prop()
    urlKey?: string;

    @Prop()
    banner?: string;

    @Prop()
    image?: string;

    // Parent category (for subcategories)
    @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
    parentId?: Types.ObjectId | null;


    // Level in tree (0 = root)
    @Prop({ default: 0 })
    level?: number;

    // For sorting in UI
    @Prop({ default: 0 })
    order?: number;

    // Status flags
    @Prop({ default: true })
    isActive?: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);


// Hierarchy + sorting
CategorySchema.index({ parentId: 1, order: 1 });

// Active + soft delete filter
CategorySchema.index({ isDeleted: 1, isActive: 1 });

// Prevent duplicate under same parent
CategorySchema.index({ name: 1, parentId: 1 }, { unique: true });

CategorySchema.index({ parentId: 1 });
//   Timestamp index (optional but useful)
CategorySchema.index({ createdAt: -1 });


// CategorySchema.pre('save', async function () {
//   if (!this.urlKey) {
//     this.urlKey = this.name.toLowerCase().replace(/\s+/g, '-');
//   }
// });