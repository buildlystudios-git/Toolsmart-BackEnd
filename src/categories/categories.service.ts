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
import { CategoryProductFilterDto } from './dto/get-category-product.dto';
import { S3Service } from 'src/utils/s3.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,

    @InjectModel(Product.name)
    private productModel: Model<Product>,

    private readonly s3Service: S3Service,
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

    let category = await this.categoryModel.create(dto);

    if (dto.image) {
      const uploaded = await this.s3Service.uploadBase64(dto.image, `category-${category._id}`);
      category.image = uploaded.url;
      category = await category.save();
    }

    return category;
  }

  // Get all 
  async findAll(query: CategoryFilterDto) {

    let {
      id,
      name
    } = query;

    const filter: any = {  };

    if (id) {
      try {
        filter._id = new Types.ObjectId(id);
      } catch (error) {
        throw new BadRequestException('Invalid category Id');
      }
    }
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const categories = await this.categoryModel.find({...filter}).sort({ order: 1 });
    if (Object.keys(filter).length > 0 && categories.length < 1) {
      throw new NotFoundException('No categories found matching the criteria');
    }
    
    return categories;
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

    if (dto.image) {
      const uploaded = await this.s3Service.uploadBase64(dto.image, `category-${category._id}`);
      dto.image = uploaded.url;
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

  async getCategoryProducts(id: string, query: CategoryProductFilterDto) {

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    
    const sort: any = { order: 1 };

    // if (sortBy) {
    //   try {
    //     const sortObj = JSON.parse(sortBy);
    //     Object.assign(sort, sortObj);
    //   } catch (error) {
    //     throw new BadRequestException('Invalid sortBy format');
    //   }
    // }

    return this.productModel.find({ categoryId: id }).sort(sort);
  }
}