import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard/roles.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET MY PROFILE
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get logged-in user profile' })
  @Get('me')
  async getProfile(@Req() req) {
    return await this.usersService.findById(req.user.sub);
  }

  // UPDATE MY PROFILE
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update logged-in user profile' })
  @Patch('me')
  async updateProfile(@Req() req, @Body() body) {
    return await this.usersService.updateUser(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user' })
  @Delete('me')
  async deleteUser(@Req() req) {
    return await this.usersService.deleteUser(req.user.sub);
  }

  // // GET ALL USERS (ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // @ApiOperation({ summary: 'Get all users (Admin only)' })
  // @Get()
  // async getAllUsers() {
  //   return await this.usersService.findAll();
  // }

  // // GET USER BY ID (ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  // @Get(':id')
  // async getUserById(@Param('id') id: string) {
  //   return await this.usersService.findById(id);
  // }

  // // UPDATE USER (ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  // @Patch(':id')
  // async updateUser(
  //   @Param('id') id: string,
  //   @Body() body
  // ) {
  //   return await this.usersService.updateUser(id, body);
  // }

  // DELETE USER (ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // @ApiOperation({ summary: 'Delete user (Admin only)' })
  // @Delete(':id')
  // async deleteUser(@Req() req) {
  //   return await this.usersService.deleteUser(req.user.sub);
  // }
}