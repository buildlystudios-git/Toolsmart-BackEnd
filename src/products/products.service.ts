import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/get-product-filter.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  // Create
  async create(dto: CreateProductDto) {

    const existingProduct = await this.productModel.findOne({ name: dto.name });
    if (existingProduct) {
      throw new BadRequestException('Product with the same name already exists');
    }

    return this.productModel.create(dto);
  }

  // Find All (filters + pagination)
  async findAll(query: ProductFilterDto) {
    let {
      id,
      brand,
      categoryId,
      minPrice,
      maxPrice,
      name,
      page = 1,
      limit = 10,
    } = query;

    if(page < 1){
      page = 1;
    }

    const filter: any = {  };

    if (id) {
      filter._id = new Types.ObjectId(id);
    }

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const data = await this.productModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await this.productModel.countDocuments(filter);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  
  // Find One
  async findById(id: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Update
  async update(id: string, dto: UpdateProductDto) {
    const existingProduct1 = await this.productModel.findById(id);
    if (!existingProduct1) throw new NotFoundException('Product not found');

    const existingProduct2 = await this.productModel.findOne({ name: dto.name });
    if (existingProduct2) {
      throw new BadRequestException('Product with the same name already exists');
    }
    const product = await this.productModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );

    return product;
  }

  // Delete
  async delete(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
        throw new NotFoundException('Product not found');
    }

    await this.productModel.deleteOne({ _id: id });

    return { message: 'Product deleted' };
  }
}