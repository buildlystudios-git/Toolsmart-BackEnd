import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TermsDocument,
  TermsDocumentDocument,
} from './schemas/terms.schema';
import { TermsDocumentType } from './enums/terms.enum';
import { CreateTermsDto } from './dto/create-terms.dto';
import { UpdateTermsDto } from './dto/update-terms.dto';

@Injectable()
export class TermsService {
  constructor(
    @InjectModel(TermsDocument.name)
    private readonly termsModel: Model<TermsDocumentDocument>,
  ) {}

  async create(createTermsDto: CreateTermsDto): Promise<TermsDocument> {
    
    const document = await this.termsModel.findOne({
      type: createTermsDto.type
    });

    if (document) {
      throw new BadRequestException(`Document of type ${createTermsDto.type} already exists`);
    }

    return this.termsModel.create(createTermsDto);
  }

  async findAll(): Promise<TermsDocument[]> {
    return this.termsModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<TermsDocument> {
    const document = await this.termsModel.findById(id);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async findByType(type: TermsDocumentType): Promise<TermsDocument> {
    const document = await this.termsModel.findOne({
      type,
      isActive: true,
    });

    if (!document) {
      throw new NotFoundException(`${type} not found`);
    }

    return document;
  }

  async update(
    id: string,
    updateTermsDto: UpdateTermsDto,
  ): Promise<TermsDocument> {
    const document = await this.termsModel.findByIdAndUpdate(
      id,
      updateTermsDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async remove(id: string): Promise<void> {
    const result = await this.termsModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Document not found');
    }
  }
}