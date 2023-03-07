import JwtAuthenticationGuard from '@auth/guards/jwt-authentication.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthenticationGuard)
  @Get('profile')
  @ApiExcludeEndpoint()
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
