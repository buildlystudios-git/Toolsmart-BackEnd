import { PartialType } from '@nestjs/mapped-types';
import { CreateTermsDto } from './create-terms.dto';

export class UpdateTermsDto extends PartialType(CreateTermsDto) {}