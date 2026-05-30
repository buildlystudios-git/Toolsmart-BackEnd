import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from 'src/products/schemas/product.schema';
import { ProductFilterDto } from 'src/products/dto/get-product-filter.dto';
import { CategoryFilterDto } from './dto/get-category-filter.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,

    @InjectModel(Product.name)
    private productModel: Model<Product>
  ) {}

  // Create
  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.categoryModel.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const existingCategory = await this.categoryModel.findOne({ name: dto.name });
    if (existingCategory) {
      throw new BadRequestException('Category with the same name already exists');
    }

    return this.categoryModel.create(dto);
  }

  // Get all 
  async findAll(query: CategoryFilterDto) {

    let {
      id,
      name
    } = query;

    const filter: any = {  };

    if (id) {
      filter._id = new Types.ObjectId(id);
    }
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    return await this.categoryModel.find().sort({ order: 1 });
  }

  // Get by ID
  async findById(id: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // Update
  async update(id: string, dto: UpdateCategoryDto) {

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingCategory = await this.categoryModel.findOne({ name: dto.name });
    if (existingCategory) {
      throw new BadRequestException('Category with the same name already exists');
    }

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );

    return updatedCategory;
  }

  // delete
  async delete(id: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryModel.deleteOne({ _id: id });

    return { message: 'Category deleted' };
  }

  async getCategoryProducts(id: string) {

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    return this.productModel.find({ categoryId: id }).sort({ order: 1 });
  }
}