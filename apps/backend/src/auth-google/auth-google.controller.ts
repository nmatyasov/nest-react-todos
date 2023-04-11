import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import GoogleOAuthGuard from './guards/google-oauth.guard';
import { UsersService } from '@users/users.service';
import { AuthGoogleService } from './auth-google.service';
import RequestWithUser from '@auth/requestWithUser.interface';
import { GetFingerprintBrowser } from '@auth/get-fingerprint.decorator';
import { AuthUserDto } from '@auth/dto/auth-login.dto';
import { AuthService } from '@auth/auth.service';
import { getCookieOptions } from '../config/cookie-options';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@libs/payload.interface';

@ApiTags('Authentication with Google OAuth')
@UseGuards(GoogleOAuthGuard)
@Controller('auth-google')
export class AuthGoogleController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authGoogleService: AuthGoogleService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}



  @ApiOperation({
    summary: 'Try login with Google account',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  @Get('google')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async auth() {}



  @ApiOperation({ summary: 'Login' })
  @ApiQuery({
    name: 'RequestWithUser',
    required: true,
    description: 'User credentionals',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Set header auth coockies and jwtPayload',
    type: JwtPayload,
  })
  @Get('google-redirect')
  async googleAuthRedirect(
    @GetFingerprintBrowser() fingerprint: string,
    @Req() req: RequestWithUser,
    res: Response
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
      username: req.user.username,
      refreshToken: loginStatus.refreshToken,
      roles: loginStatus.roles,
      avatar: req.user.avatar,
    };
  }
}
