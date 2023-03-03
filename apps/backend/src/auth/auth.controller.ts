import { AuthService } from "@auth/auth.service";
import { LocalAuthenticationGuard } from "@auth/guards/localAuthentication.guard";
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
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthUserDto } from "@auth/dto/auth-login.dto";
import JwtAuthenticationGuard from "@auth/guards/jwt-authentication.guard";

import RequestWithUser from "@auth/requestWithUser.interface";
import { RegistrationStatus } from "@libs/registartion-status.interface";

import { CreateUserDto } from "@users/dto/user.create.dto";
import { JwtPayload } from "@libs/payload.interface";
import { Response } from "express";
import { getCookieOptions } from "../config/cookie-options";
import JwtRefreshGuard from "@auth/guards/jwt-refresh.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post("register")
  public async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(
      createUserDto
    );

    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post("login")
  public async login(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<JwtPayload> {
    const loginStatus: AuthUserDto =
      await this.authService.getCookieWithJwtToken(req.user._id);

    /*задаем куки */

    res.cookie(
      "AccessToken",
      loginStatus.accessToken,
      getCookieOptions(this.configService, "JWT_ACCESS_TOKEN_EXPIRATION_TIME")
    );
    res.cookie(
      "RefreshToken",
      loginStatus.refreshToken,
      getCookieOptions(this.configService, "JWT_REFRESH_TOKEN_EXPIRATION_TIME")
    );

    return { _id: loginStatus._id, username: loginStatus.username };
  }

  @UseGuards(JwtRefreshGuard)
  @Get("refresh")
  async refresh(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<JwtPayload> {

    const authUser: AuthUserDto =
      await this.authService.getCookieWithJwtAccessToken(req.user._id);

    res.cookie(
      "AccessToken",
      authUser.accessToken,
      getCookieOptions(this.configService, "JWT_ACCESS_TOKEN_EXPIRATION_TIME")
    );
    return { _id: authUser._id, username: authUser.username };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post("logout")
  @HttpCode(200)
  async logOut(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.authService.logout(req.user._id);

    res.cookie("AccessToken", "", {
      maxAge: 0,
    });
    res.cookie("RefreshToken", "", {
      maxAge: 0,
    });
  }
}
