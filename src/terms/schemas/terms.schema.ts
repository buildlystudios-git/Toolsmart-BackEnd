import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TermsDocumentType } from '../enums/terms.enum';

export type TermsDocumentDocument = HydratedDocument<TermsDocument>;

@Schema({
  timestamps: true,
  collection: 'terms_documents',
})
export class TermsDocument {
  @Prop({
    type: String,
    enum: TermsDocumentType,
    required: true,
    unique: true,
    index: true,
    default: TermsDocumentType.TERMS_AND_CONDITIONS
  })
  type!: TermsDocumentType;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    type: String,
    required: true,
  })
  content!: string;

  @Prop({
    type: String,
    default: '1.0',
  })
  version!: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isActive!: boolean;
}

export const TermsDocumentSchema =
  SchemaFactory.createForClass(TermsDocument);