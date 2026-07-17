import { Module } from '@nestjs/common';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TermsDocument, TermsDocumentSchema } from './schemas/terms.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TermsDocument.name,
        schema: TermsDocumentSchema,
      },
    ]),
  ],
  controllers: [TermsController],
  providers: [TermsService]
})
export class TermsModule {}
