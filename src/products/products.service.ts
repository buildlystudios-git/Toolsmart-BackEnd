import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { Product } from './schemas/product.schema';
import { Category } from '../categories/schemas/category.schema';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/get-product-filter.dto';
import { S3Service } from 'src/utils/s3.service';

@Injectable()
export class ProductsService {

  /**
   * Batch Size
   */
  private readonly BATCH_SIZE =
    Number(process.env.BULK_BATCH_SIZE) || 500;

  /**
   * Required CSV Headers
   */
  private readonly REQUIRED_HEADERS = [
    'name',
    'description',
    'about',
    'brand',
    'banner',
    'category',
    'imageUrls',
    'price',
    'mrp',
    'quantity',
    'order',
    'isActive',
  ];
  
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,

    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,

    private readonly s3Service: S3Service,
  ) {}

  // Create
  async create(dto: CreateProductDto) {

    const product = {...dto};
    if (dto.categoryId) {
      try {
        // @ts-ignore
        product["categoryId"] = new Types.ObjectId(dto.categoryId);
      } catch (error) {
        throw new BadRequestException('Invalid category Id');
      }
    }
    
    let productDoc = await this.productModel.create(product);

    if (product.images && product.images.length > 0) {
      const uploaded = await this.s3Service.uploadMultipleBase64(product.images, `product-${productDoc._id}`);
      productDoc.images = await uploaded.map(img => img.url);
      productDoc = await productDoc.save();
    }
    return productDoc;
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
      sortBy
    } = query;

    if(page < 1){
      page = 1;
    }

    const filter: any = {  };

    if (id) {
      try {
        filter._id = new Types.ObjectId(id);
      } catch (error) {
        throw new BadRequestException('Invalid id');
      }
    }

    if (categoryId) {
      try {
        filter.categoryId = new Types.ObjectId(categoryId);
      } catch (error) {
        throw new BadRequestException('Invalid category Id');
      }
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

    const sort: any = { order: 1 };

    // if (sortBy) {
    //   try {
    //     const sortObj = JSON.parse(sortBy);
    //     Object.assign(sort, sortObj);
    //   } catch (error) {
    //     throw new BadRequestException('Invalid sortBy format');
    //   }
    // }
    
    const skip = (page - 1) * limit;

    const data = await this.productModel
      .find(filter)
      .sort(sort)
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

    if (dto.images && dto.images.length > 0) {
      const uploaded = await this.s3Service.uploadMultipleBase64(dto.images, `product-${existingProduct1._id}`);
      dto.images = uploaded.map(img => img.url);
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
    let productId: Types.ObjectId;
    try {
      productId = new Types.ObjectId(id);
    } catch (error) {
      throw new BadRequestException('Invalid id');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productModel.deleteOne({ _id: productId });

    return { message: 'Product deleted' };
  }


  /**
   * Bulk Upload Products
   */
  async bulkUpload(
    userId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'CSV file is required.',
      );
    }

    const rows = await this.parseCsv(file);

    if (!rows.length) {
      throw new BadRequestException(
        'CSV is empty.',
      );
    }

    return this.importProducts(rows);
  }

  /**
   * Parse CSV
   */
  private parseCsv(
    file: Express.Multer.File,
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];

      let headerValidated = false;

      Readable.from(file.buffer)
        .pipe(csv())

        .on('headers', (headers: string[]) => {
          this.validateHeaders(headers);
          headerValidated = true;
        })

        .on('data', (row) => {
          rows.push(row);
        })

        .on('end', () => {
          if (!headerValidated) {
            return reject(
              new BadRequestException(
                'Invalid CSV file.',
              ),
            );
          }

          resolve(rows);
        })

        .on('error', reject);
    });
  }

  /**
   * Validate CSV Headers
   */
  private validateHeaders(
    headers: string[],
  ) {
    const normalized = headers.map((h) =>
      h.trim(),
    );

    const missing =
      this.REQUIRED_HEADERS.filter(
        (header) =>
          !normalized.includes(header),
      );

    if (missing.length) {
      throw new BadRequestException(
        `Missing columns: ${missing.join(', ')}`,
      );
    }
  }

  /**
   * Normalize String
   */
  private normalize(
    value: any,
  ): string {
    if (
      value === undefined ||
      value === null
    ) {
      return '';
    }

    return value.toString().trim();
  }

  /**
   * Parse Boolean
   */
  private parseBoolean(
    value: any,
  ): boolean {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return true;
    }

    return [
      'true',
      '1',
      'yes',
      'y',
    ].includes(
      value
        .toString()
        .trim()
        .toLowerCase(),
    );
  }

  /**
   * Parse Number
   */
  private parseNumber(
    value: any,
    field: string,
  ): number {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return 0;
    }

    const number = Number(value);

    if (isNaN(number)) {
      throw new Error(
        `${field} must be a valid number.`,
      );
    }

    return number;
  }

  /**
   * Validate Product Row
   */
  private validateRow(
    row: any,
    categoryMap: Map<string, any>,
    productMap: Map<string, any>,
    uploadedProducts: Set<string>,
  ) {
    /**
     * Product Name
     */
    const name = this.normalize(row.name);

    if (!name) {
      throw new Error(
        'Product name is required.',
      );
    }

    /**
     * Duplicate in CSV
     */
    const productKey = name.toLowerCase();

    if (uploadedProducts.has(productKey)) {
      throw new Error(
        `Duplicate product '${name}' found in CSV.`,
      );
    }

    /**
     * Already Exists
     */
    if (productMap.has(productKey)) {
      throw new Error(
        `Product '${name}' already exists.`,
      );
    }

    uploadedProducts.add(productKey);

    /**
     * Category
     */
    const categoryName = this.normalize(
      row.category,
    );

    if (!categoryName) {
      throw new Error(
        'Category is required.',
      );
    }

    const category = categoryMap.get(
      categoryName.toLowerCase(),
    );

    if (!category) {
      throw new Error(
        `Category '${categoryName}' not found.`,
      );
    }

    /**
     * Price
     */
    const price = this.parseNumber(
      row.price,
      'Price',
    );

    if (price <= 0) {
      throw new Error(
        'Price must be greater than zero.',
      );
    }

    /**
     * MRP
     */
    const mrp = this.parseNumber(
      row.mrp,
      'MRP',
    );

    if (mrp < price) {
      throw new Error(
        'MRP cannot be less than Price.',
      );
    }

    /**
     * Quantity
     */
    const quantity = this.parseNumber(
      row.quantity,
      'Quantity',
    );

    if (quantity < 0) {
      throw new Error(
        'Quantity cannot be negative.',
      );
    }

    /**
     * Order
     */
    const order = this.parseNumber(
      row.order,
      'Order',
    );

    /**
     * Images
     * CSV Example:
     * image1.jpg|image2.jpg|image3.jpg
     */
    const images = this.normalize(
      row.imageUrls,
    )
      .split('|')
      .map((image) => image.trim())
      .filter(Boolean);

    /**
     * Banner
     */
    const banner = this.normalize(
      row.banner,
    );

    /**
     * Brand
     */
    const brand = this.normalize(
      row.brand,
    );

    /**
     * About
     */
    const about = this.normalize(
      row.about,
    );

    /**
     * Description
     */
    const description =
      this.normalize(
        row.description,
      );

    /**
     * Active
     */
    const isActive =
      this.parseBoolean(
        row.isActive,
      );

    /**
     * Build Product Object
     */
    return {
      name,
      description,
      about,
      brand,
      banner,
      categoryId:
        category._id as Types.ObjectId,
      images,
      price,
      mrp,
      quantity,
      order,
      isActive,
    };
  }

  /**
   * Import Products
   */
  private async importProducts(
    rows: any[],
  ) {
    /**
     * Upload Summary
     */
    const summary = {
      total: rows.length,
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    /**
     * Load Categories
     */
    const categories =
      await this.categoryModel.find(
        {},
        {
          _id: 1,
          name: 1,
        },
      );

    /**
     * Category Map
     */
    const categoryMap = new Map(
      categories.map((category) => [
        category.name
          .trim()
          .toLowerCase(),
        category,
      ]),
    );

    /**
     * Load Existing Products
     */
    const products =
      await this.productModel.find(
        {},
        {
          _id: 1,
          name: 1,
        },
      );

    /**
     * Product Map
     */
    const productMap = new Map(
      products.map((product) => [
        product.name
          .trim()
          .toLowerCase(),
        product,
      ]),
    );

    /**
     * Detect Duplicate Products
     * within uploaded CSV
     */
    const uploadedProducts =
      new Set<string>();

    /**
     * Insert Batch
     */
    let batch: any[] = [];

    for (
      let index = 0;
      index < rows.length;
      index++
    ) {
      const row = rows[index];

      try {
        const product =
          this.validateRow(
            row,
            categoryMap,
            productMap,
            uploadedProducts,
          );

        batch.push(product);

        /**
         * Insert Batch
         */
        if (
          batch.length >=
          this.BATCH_SIZE
        ) {
          await this.insertBatch(
            batch,
            productMap,
            summary,
          );

          batch = [];
        }
      } catch (error: any) {
        summary.failed++;

        summary.errors.push({
          row: index + 2,
          product:
            row.name || '',
          message:
            error.message,
        });
      }
    }

    /**
     * Remaining Batch
     */
    if (batch.length) {
      await this.insertBatch(
        batch,
        productMap,
        summary,
      );
    }

    return summary;
  }

  /**
   * Insert Batch
   */
  private async insertBatch(
    batch: any[],
    productMap: Map<string, any>,
    summary: {
      total: number;
      success: number;
      failed: number;
      errors: any[];
    },
  ) {
    if (!batch.length) {
      return;
    }

    try {
      /**
       * Insert all products
       */
      const insertedProducts =
        await this.productModel.insertMany(
          batch,
          {
            ordered: false,
          },
        );

      /**
       * Success Count
       */
      summary.success +=
        insertedProducts.length;

      /**
       * Update Product Map
       */
      insertedProducts.forEach(
        (product) => {
          productMap.set(
            product.name
              .trim()
              .toLowerCase(),
            product,
          );
        },
      );
    } catch (error: any) {
      /**
       * Bulk Write Error
       */
      if (
        error.writeErrors &&
        Array.isArray(
          error.writeErrors,
        )
      ) {
        /**
         * Successful Inserts
         */
        if (
          error.result?.insertedIds
        ) {
          summary.success +=
            Object.keys(
              error.result
                .insertedIds,
            ).length;
        }

        /**
         * Failed Rows
         */
        error.writeErrors.forEach(
          (writeError: any) => {
            summary.failed++;

            summary.errors.push({
              product:
                writeError.err.op
                  ?.name ||
                '',
              message:
                writeError.errmsg ||
                'Insert failed.',
            });
          },
        );

        return;
      }

      /**
       * Unknown Error
       */
      throw error;
    }
  }
}