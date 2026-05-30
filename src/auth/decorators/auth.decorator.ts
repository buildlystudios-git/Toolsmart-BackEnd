import { applyDecorators, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard/jwt-auth.guard';

export function Auth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard)
  );
}