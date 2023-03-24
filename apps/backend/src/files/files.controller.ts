import { GetUser } from '@auth/get-user.decorator';
import JwtAuthenticationGuard from '@auth/guards/jwt-authentication.guard';
import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserDto } from '@users/dto/user.dto';
import { Response } from 'express';
import { join } from 'path';
import { multerOptions } from '../config/mutler.config';


@Controller('files')
export class FilesController {
  constructor(private readonly configService: ConfigService) {}
  // upload single file
  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multerOptions.storage,
      fileFilter: multerOptions.fileFilter,
    })
  )
  async uploadedFile(
    @GetUser() user: UserDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };
    return {
      status: HttpStatus.OK,
      message: 'Image uploaded successfully!',
      data: response,
    };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('uploadMultipleFiles')
  @UseInterceptors(
    FilesInterceptor('image', 10, {
      storage: multerOptions.storage,
      fileFilter: multerOptions.fileFilter,
    })
  )
  async uploadMultipleFiles(
    @GetUser() user: UserDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
      };
      response.push(fileReponse);
    });
    return {
      status: HttpStatus.OK,
      message: 'Images uploaded successfully!',
      data: response,
    };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get(':imagename')
  getImage(
    @GetUser() user: UserDto,
    @Param('imagename') image: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const rootPath: string = join(
      __dirname,
      this.configService.get<string>('STATIC_FOLDER')
    );
    res.sendFile(image, { root: rootPath });
    return {
      status: HttpStatus.OK,
      message: 'Image sended successfully!',
      data: image,
    };
  }
}
