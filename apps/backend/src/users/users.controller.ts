import JwtAuthenticationGuard from '@auth/guards/jwt-authentication.guard';
import RequestWithUser from '@auth/requestWithUser.interface';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '@users/users.service';
import { ParseObjectIdPipe } from '../app/shared/pipes';
import { Types } from 'mongoose';
import { multerOptions } from '../config/mutler.config';
import { UserDto } from '@users/dto/user.dto';
import { JwtPayload } from '@libs/payload.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(JwtAuthenticationGuard)
  @Get('profile')
  @ApiExcludeEndpoint()
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post(':id/avatar')
  @ApiOperation({ summary: "Upload user avatar" })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', required: true, description: 'User identifier' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return jwtPayload',
    type: JwtPayload,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multerOptions.storage,
      fileFilter: multerOptions.fileFilter,
    }),
  )
  async uploadAvatar(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File
  ) :Promise<UserDto> {
    return await this.usersService.setAvatar(id, file.filename);
  }
}
