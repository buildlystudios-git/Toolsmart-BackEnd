import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Approvals')
@ApiBearerAuth()
@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly service: ApprovalsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateApprovalDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApprovalDto) {
    return this.service.update(id, dto);
  }

  //  Approve
  @Post(':id/approve')
  approve(@Req() req: any, @Param('id') id: string) {
    return this.service.approve(id, req.user.sub);
  }

  //  Reject
  @Post(':id/reject')
  reject(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.service.reject(id, req.user.sub, reason);
  }
}