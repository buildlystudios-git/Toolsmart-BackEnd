import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import csv from 'csv-parser';
import { Readable } from 'stream';
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
   /**
   * Number of records to insert in one batch
   */
  private readonly BATCH_SIZE =
    Number(process.env.BULK_BATCH_SIZE) || 500;

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

    let {  id, name, level, sortBy } = query;

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

    if (level) {
      filter.level = level;
    }

    const MATCH_STAGE = {
      $match: filter
    }

    const LOOKUP_STAGE = {
      $lookup:{
        from: "categories",
        localField: "_id",
        foreignField: "parentId",
        as: "childCategories"
      }
    }

    const ADD_FIELD_STAGE = {
      $addFields:{
        "childCategoriesCount": { $size: "$childCategories" }
      }
    }

    const PROJECT_STAGE = {
      $project: {
        childCategories:0   
      }
    }

    const sortByObj = {};
    if(sortBy) {
      const sortObj = JSON.parse(sortBy);
      Object.assign(sortByObj, sortObj);
    } else {
      Object.assign(sortByObj, { order: 1 });
    }

    const SORT_STAGE = {
      $sort: sortByObj
    }

    const PIPELINE: any = [];
    Object.keys(filter).length > 0 && PIPELINE.push(MATCH_STAGE);
    PIPELINE.push(LOOKUP_STAGE);
    PIPELINE.push(ADD_FIELD_STAGE);
    PIPELINE.push(PROJECT_STAGE);
    PIPELINE.push(SORT_STAGE);

    const categories = await this.categoryModel.aggregate(PIPELINE);
    
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

    return this.productModel.find({ categoryId: id }).sort(sort);
  }

  /**
   * Bulk Upload Categories
   */
  async bulkUpload(
    userId: string,
    file: Express.Multer.File,
  ) {
    const rows = await this.parseCsv(file);

    if (!rows.length) {
      throw new BadRequestException('CSV is empty.');
    }

    return this.importCategories(rows);
  }

  /**
   * Parse CSV
   */
  private parseCsv(
    file: Express.Multer.File,
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];

      Readable.from(file.buffer)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }

  /**
   * Import Categories
   */
  private async importCategories(rows: any[]) {
    const errors: any[] = [];

    const inserted = 0;

    /**
     * Existing Categories
     */
    const categories = await this.categoryModel.find(
      {},
      {
        name: 1,
        _id: 1,
      },
    );

    /**
     * Fast lookup map
     */
    const categoryMap = new Map(
      categories.map((c) => [
        c.name.trim().toLowerCase(),
        c,
      ]),
    );

    /**
     * Batch
     */
    let batch: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const category =
          await this.validateRow(
            row,
            categoryMap,
          );

        batch.push(category);

        /**
         * Batch Insert
         */
        if (
          batch.length >= this.BATCH_SIZE
        ) {
          await this.insertBatch(batch);

          batch = [];
        }
      } catch (e: any) {
        errors.push({
          row: i + 2,
          error: e.message,
        });
      }
    }

    /**
     * Remaining
     */
    if (batch.length) {
      await this.insertBatch(batch);
    }

    return {
      total: rows.length,
      success:
        rows.length - errors.length,
      failed: errors.length,
      errors,
    };
  }

  /**
   * Validate CSV Row
   */
  private async validateRow(
    row: any,
    categoryMap: Map<string, any>,
  ) {
    const name = row.name?.trim();

    if (!name) {
      throw new Error(
        'Category name is required.',
      );
    }

    if (
      categoryMap.has(
        name.toLowerCase(),
      )
    ) {
      throw new Error(
        'Category already exists.',
      );
    }

    let parentId = null;
    let level = 0;
    let order = 0;

    if (row.parentCategory) {
      const parent =
        categoryMap.get(
          row.parentCategory
            .trim()
            .toLowerCase(),
        );

      if (!parent) {
        throw new Error(
          `Parent category '${row.parentCategory}' not found.`,
        );
      }

      parentId = parent._id;
      level = (parent.level || 0) + 1;
      order = row.sortOrder;
    }

    return {
      name,
      description:
        row.description || '',
      parentId,
      order:
        Number(row.sortOrder) || 0,
      image:
        row.imageUrl || '',
      isActive:
        row.isActive?.toLowerCase() !==
        'false',
      level,
    };
  }

  /**
   * Insert Batch
   */
  private async insertBatch(
    batch: any[],
  ) {
    await this.categoryModel.insertMany(
      batch,
      {
        ordered: false,
      },
    );
  }  
}