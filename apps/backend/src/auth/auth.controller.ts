import { AuthService } from '@auth/auth.service';
import { LocalAuthenticationGuard } from '@auth/guards/localAuthentication.guard';
import {
  Controller,
  Post,
  UseGuards,
  Req,
  HttpCode,
  Get,
  HttpException,
  HttpStatus,
  Body,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthUserDto } from '@auth/dto/auth-login.dto';
import JwtAuthenticationGuard from '@auth/guards/jwt-authentication.guard';

import RequestWithUser from '@auth/requestWithUser.interface';
import { RegistrationStatus } from '@libs/registartion-status.interface';

import { CreateUserDto } from '@users/dto/user.create.dto';
import { JwtPayload } from '@libs/payload.interface';
import { Response } from 'express';
import { getCookieOptions } from '../config/cookie-options';
import JwtRefreshGuard from '@auth/guards/jwt-refresh.guard';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { credentialsUserDto } from '@auth/dto/credentialsUser.dto';
import { GetFingerprintBrowser } from '@auth/get-fingerprint.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @ApiOperation({
    summary: 'Creates a new user and send email for confirm email',
  })
  @ApiQuery({
    name: 'createUserDto',
    required: true,
    description: 'User credentionals',
    type: CreateUserDto,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Post('register')
  public async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(
      createUserDto
    );

    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    /*В случае успешной регистрации запрашиваем подтверждение почты и переходим на форму авторизации*/
    return result;
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiQuery({
    name: 'RequestWithUser',
    required: true,
    description: 'User credentionals',
    type: credentialsUserDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Set header auth coockies and jwtPayload',
    type: JwtPayload,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  public async login(
    @GetFingerprintBrowser() fingerprint: string,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<JwtPayload> {
    const loginStatus: AuthUserDto =
      await this.authService.getCookieWithJwtToken(req.user._id, fingerprint);

    /*задаем куки */
    res.cookie(
      'AccessToken',
      loginStatus.accessToken,
      getCookieOptions(this.configService, 'JWT_ACCESS_TOKEN_EXPIRATION_TIME')
    );
    res.cookie(
      'RefreshToken',
      loginStatus.refreshToken,
      getCookieOptions(this.configService, 'JWT_REFRESH_TOKEN_EXPIRATION_TIME')
    );

    return {
      _id: loginStatus._id,
      username: loginStatus.username,
      refreshToken: loginStatus.refreshToken,
      roles: loginStatus.roles,
      avatar:loginStatus.avatar,
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  @ApiOperation({ summary: 'Resfresh access token in coockie' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refresh header with access token',
    type: JwtPayload,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async refresh(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<JwtPayload> {
    const authUser: AuthUserDto =
      await this.authService.getCookieWithJwtAccessToken(req.user._id);

    res.cookie(
      'AccessToken',
      authUser.accessToken,
      getCookieOptions(this.configService, 'JWT_ACCESS_TOKEN_EXPIRATION_TIME')
    );
    return {
      _id: authUser._id,
      username: authUser.username,
      refreshToken: authUser.refreshToken,
      roles: authUser.roles,
    };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Nullable auth tokens in coockies' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return nullable auth coockies',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async logOut(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.authService.logout(req.user._id, req.user.refreshToken);

    res.cookie('AccessToken', '', {
      maxAge: 0,
    });
    res.cookie('RefreshToken', '', {
      maxAge: 0,
    });
  }
}
