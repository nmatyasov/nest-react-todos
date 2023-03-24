import { AuthUserDto } from '@auth/dto/auth-login.dto';
import { Types } from 'mongoose';
import { RegistrationStatus } from '@libs/registartion-status.interface';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '@users/dto/user.create.dto';
import { UsersService } from '@users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@libs/payload.interface';
import { UserDto } from '@users/dto/user.dto';
import { credentialsUserDto } from '@auth/dto/credentialsUser.dto';
import { EmailConfirmationService } from './../email-confirmation/email-confirmation.service';
import { RefreshSessionsService } from './../refresh-sessions/refresh-sessions.service';
import { RefreshTokenSessionDto } from './../refresh-sessions/dto/refreshTokenSession.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly refreshSessionsService: RefreshSessionsService
  ) {}
  /**
   * Регистрация нового пользователя
   * @param {CreateUserDto} userDto регистрационная информация пользователя
   * @returns {RegistrationStatus} Promise с результатом регистрации
   */

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: 'user registered',
      url: this.configService.get<string>('FRONTEND_URL') + '/login.html',
    };

    try {
      const user = await this.usersService.create(userDto);
      await this.emailConfirmationService.sendVerifictionLink(user.email);
    } catch (err) {
      status = {
        success: false,
        message: err,
        url:
          this.configService.get<string>('FRONTEND_URL') + '/registration.html',
      };
    }
    return status;
  }

  /**
   * Создаем данные пользователя для Response и сохраняем RefreshToken в БД
   * @param {ObjectId} userId идентификатор пользователя
   * @param {string} fingerprint fingerprint браузера пользователя
   * @returns {AuthUserDto} Promise с результатом регистрации и куками
   */
  async getCookieWithJwtToken(
    userId: Types.ObjectId,
    fingerprint: string
  ): Promise<AuthUserDto> {
    const user = await this.usersService.findById(userId);

    const payload: JwtPayload = {
      _id: user._id,
      username: user.username,
      roles: user.roles,
      avatar: user.avatar,
    };
    const tokens = await this.getTokens(payload);

    const expires: string = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME'
    );
    /*к текущему времени в секундах прибавляем врямя жизни refresh token в секундах и сохраняем как Unix timestamp */
    const expiresIn: number =
      Math.floor(Date.now() / 1000) + parseInt(expires, 10);
    const refreshTokenSessionDto: RefreshTokenSessionDto = {
      token: tokens.refreshToken,
      fingerprint,
      expiresIn,
      userId,
    };
    /* запись refersToken*/
    await this.refreshSessionsService.saveToken(refreshTokenSessionDto);

    return {
      _id: user._id,
      username: user.username,
      ...tokens,
      roles: user.roles,
      avatar: user.avatar,
    };
  }

  /**
   * Создаем данные пользователя для Response используется с обновления AccessToken
   * @param {ObjectId} userId идентификатор пользователя
   * @returns {AuthUserDto} Promise с результатом регистрации и куками
   */
  async getCookieWithJwtAccessToken(
    userId: Types.ObjectId
  ): Promise<AuthUserDto> {
    const user = await this.usersService.findById(userId);

    const payload: JwtPayload = {
      _id: user._id,
      username: user.username,
      roles: user.roles,
    };
    const tokens = await this.getTokens(payload);

    return {
      _id: user._id,
      username: user.username,
      ...tokens,
      roles: user.roles,
      avatar: user.avatar,
    };
  }

  /**
   * Ищем пользователя по email и password
   * @param {string} email
   * @param {string} password
   * @returns {UserDto} Promise single UserDto
   */
  async validateUser(email: string, password: string): Promise<UserDto> {
    const loginUserDto: credentialsUserDto = { email, password };
    const user = await this.usersService.findByLogin(loginUserDto);

    return user;
  }

  /**
   * Ищем пользователя по идентификатору
   * @param {ObjectId} userId идетнификатор пользователя
   * @returns {UserDto} Promise single UserDto
   */
  async validateUserById(userId: Types.ObjectId): Promise<UserDto> {
    const user = await this.usersService.findById(userId);

    return user;
  }

  /**
   * Выполняем выход пользователя из приложения, удаляем RefreshToken в БД
   * @param {ObjectId} userId идетнификатор пользователя
   * @param {string} token refreshToken
   * @returns {void} Promise
   */
  async logout(userId: Types.ObjectId, token: string): Promise<void> {
    await this.refreshSessionsService.removeToken(userId, token);
  }

  /**
   * Создает токены с данными о пользователе
   * @param {JwtPayload} payload данные о пользователе
   * @returns {accessToken, refreshToken} Promise  пара токенов accessToken и refreshToken
   */
  private async getTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          payload,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: `${this.configService.get(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME'
          )}s`,
        }
      ),
      this.jwtService.signAsync(
        {
          payload,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: `${this.configService.get(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME'
          )}s`,
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
