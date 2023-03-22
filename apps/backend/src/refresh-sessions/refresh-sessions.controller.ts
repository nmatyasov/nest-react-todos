import JwtAuthenticationGuard from '@auth/guards/jwt-authentication.guard';
import RolesGuard from '@auth/guards/roles.guard';
import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import Role from '@users/role.enum';
import { ParseObjectIdPipe } from './../app/shared/pipes';
import { Types } from 'mongoose';
import { RefreshSessionsService } from './refresh-sessions.service';

@ApiTags('RefreshSessionsController')
@Controller('sessions')
@UseGuards(JwtAuthenticationGuard)
export class RefreshSessionsController {
  constructor(
    private readonly refreshSessionsService: RefreshSessionsService
  ) {}

  @UseGuards(RolesGuard(Role.Admin))
  @HttpCode(204)
  @Delete(':id')
  @ApiOperation({ summary: 'Deleting all user refresh tokens' })
  @ApiParam({ name: 'id', required: true, description: 'User identifier' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async deleteSessions(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId
  ): Promise<void> {
    this.refreshSessionsService.removeAllTokensByUserId(id);
  }
  @UseGuards(RolesGuard(Role.Admin))
  @HttpCode(204)
  @Delete()
  @ApiOperation({ summary: 'Deleting ALL users refresh tokens' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async panic(): Promise<void> {
    this.refreshSessionsService.panic();
  }
}
