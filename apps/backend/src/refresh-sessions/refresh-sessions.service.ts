import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Model, Types } from 'mongoose';
import { RefreshTokenSessionDto } from './dto/refreshTokenSession.dto';
import { RefreshSessionModel } from './models/refreshSessions.models';
import { UsersService } from '@users/users.service';
import { UserDto } from '@users/dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RefreshSessionsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    @InjectModel(RefreshSessionModel.name)
    private readonly refreshSessionModel: Model<RefreshSessionModel>
  ) {}

  /**
   * Запись в БД RefreshToken
   * @param {RefreshTokenSessionDto}   Идентификатор пользователя/token/fingerprint браузера пользователя
   * @returns Promise Идентификатор сохраненного token
   */
  async saveToken(
    refreshTokenSessionDto: RefreshTokenSessionDto
  ): Promise<Types.ObjectId> {
    const { userId, token, fingerprint, expiresIn } = refreshTokenSessionDto;

    /* Проверяем не истек ли срок годности токена, если истек то удаляем его и выбрасываем ошибку*/
    // if (!this.tokenExpiredValidation(userId, token)) {
    //   await this.removeToken(userId, token);
    //   throw new HttpException('Session expired', HttpStatus.UNAUTHORIZED);
    // }

    /*удаляем refreshToken с существующим fingerprint */
    await this.refreshSessionModel.findOneAndRemove({
      userId,
      fingerprint,
    });

    /*Чтобы не было превышений подключений */
    const cntConnection: number =
      (await this.refreshSessionModel.countDocuments({ userId })) + 1;
    const cntMaxLimitConnection = parseInt(
      this.configService.get<string>('MAX_LIMIT_CONNECTIONS'),
      10
    );
  
    if (cntConnection >= cntMaxLimitConnection) {
      await this.clearQueueTokens(userId);
    }

    const newToken: RefreshSessionModel = new this.refreshSessionModel({
      userId,
      refreshToken: token,
      fingerprint,
      expiresIn,
    });

    await newToken.save();

    return newToken._id;
  }
  /**
   * удаляем refreshToken по принципу FIFO
   * @param {Types.ObjectId} userId идентификатор пользователя
   *
   */
  async clearQueueTokens(userId: Types.ObjectId): Promise<void> {
    const olderToken: RefreshSessionModel[] = await this.refreshSessionModel
      .find({ userId })
      .sort({ createteAt: -1 })
      .limit(1);
    await this.refreshSessionModel.findByIdAndDelete({
      _id: olderToken[0]._id,
    });
  }

  /**
   * Удаление в БД RefreshToken
   * @param  {ObjectId} userId  Идентификатор пользователя
   *  @param  {string} refreshToken  refresh token
   * @returns Promise
   */
  async removeToken(
    userId: Types.ObjectId,
    refreshToken: string
  ): Promise<void> {
    await this.refreshSessionModel.deleteOne({ userId, token: refreshToken });
  }

  /**
   * Проверяет наличие и срок годности refreshToken пользователя
   * @param {Types.ObjectId} userId идентификатор пользователя
   * @param {string} refreshToken refreshToken
   * @returns {Promise<boolean>} если true валидный иначе false
   */
  async tokenExpiredValidation(
    userId: Types.ObjectId,
    refreshToken: string
  ): Promise<boolean> {
    console.log(refreshToken);
    const token: RefreshSessionModel = await this.refreshSessionModel.findOne({
      userId,
      token: refreshToken,
    });

    if (!token) {
      throw new HttpException('Invalid credantials', HttpStatus.UNAUTHORIZED);
    }

    return Date.now() >= token.expiresIn * 1000 ? true : false;
  }

  /**
   * Удаляем все токены в БД (нас хакнули, всех за борт)
   * @returns {Promise<void>}
   */
  async panic(): Promise<void> {
    this.refreshSessionModel.deleteMany();
  }

  /**
   * Удаляем все refreshTokens пользователя, те заставляем его перелогиниться со всех устройств
   * @param {Types.ObjectId} userId идентификатор пользователя
   */

  async removeAllTokensByUserId(userId: Types.ObjectId): Promise<void> {
    this.refreshSessionModel.deleteMany({ userId });
  }

  /**
   * Поиск пользователя с проверкой валидности RefreshToken
   * @param {string} refreshToken из заголовка запроса
   * @param {any} options праметры для поиcка в БД, обычно username
   * @returns  {UserDto} Promise single UserDto
   */
  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    options: object
  ): Promise<UserDto> {
    const user = await this.userService.findOne(options);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isRefreshTokenValid = this.tokenExpiredValidation(
      user._id,
      refreshToken
    );

    if (isRefreshTokenValid) {
      return user;
    }
  }
}
