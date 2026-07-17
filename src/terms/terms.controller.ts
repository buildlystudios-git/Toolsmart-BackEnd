import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TermsService } from './terms.service';
import { TermsDocumentType } from './enums/terms.enum';
import { CreateTermsDto } from './dto/create-terms.dto';
import { UpdateTermsDto } from './dto/update-terms.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Terms')
@ApiBearerAuth()
@Controller('terms')
@UseGuards(JwtAuthGuard)
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Post()
  create(@Body() createTermsDto: CreateTermsDto) {
    return this.termsService.create(createTermsDto);
  }

  @Get()
  findAll() {
    return this.termsService.findAll();
  }

  @Get('type/:type')
  findByType(@Param('type') type: TermsDocumentType) {
    return this.termsService.findByType(type);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.termsService.findOne(id);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body() updateTermsDto: UpdateTermsDto,
  ) {
    return this.termsService.update(id, updateTermsDto);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.termsService.remove(id);
  }
}