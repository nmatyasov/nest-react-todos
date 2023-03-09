import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '@users/dto/user.create.dto';
import { UserDto } from '@users/dto/user.dto';
import { compare } from 'bcrypt';
import { Model, Types } from 'mongoose';
import { toUserDto } from '../../src/app/shared/mappers';
import { UserModel } from './models/user.model';
import { credentialsUserDto } from '@auth/dto/credentialsUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>
  ) {}
  /**
   * Поиск пользователя по email, refreshToken, идентификатору пользователя
   * @param {any} options параметры поиска
   * @returns {UserDto} Promise single UserDto
   */
  //поиск пользователя в БД
  async findOne(options?: object): Promise<UserDto> {
    const user = await this.userModel.findOne(options).exec();
    return toUserDto(user);
  }

  /**
   * Поиск пользователя по идентификатору пользователя
   * @param {ObjectId} _id параметры поиска
   * @returns {UserDto} Promise single UserDto
   */
  async findById(_id: Types.ObjectId): Promise<UserDto> {
    const user = await this.userModel.findById(_id).exec();
    return toUserDto(user);
  }
  /**
   * Поиск пользователя по email и password
   * @param {string} email пользователя
   * @param {string} password пользователя
   * @returns {UserDto} Promise single UserDto
   */
  async findByLogin({ email, password }: credentialsUserDto): Promise<UserDto> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const areEqual = await compare(password, user.password);

    if (!areEqual) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return toUserDto(user);
  }

  /**
   * Поиск пользователя по имени пользователя
   * @param {string} username пользователя
   * @returns  {UserDto} Promise single UserDto
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findByPayload({ username }: any): Promise<UserDto> {
    return await this.findOne({ username });
  }
  /**
   * Создание нового пользователя, с проверкой существования в БД (username & email уникальны)
   * @param {CreateUserDto} createUserDto параметны нового пользователя
   * @returns {UserDto} Promise UserDto новый пользователь
   */

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { username, password, email } = createUserDto;

    const userExists = await this.userModel.findOne({ username }).exec();
    if (userExists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const emailExists = await this.userModel.findOne({ email }).exec();
    if (emailExists) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    const user: UserModel = new this.userModel({
      username,
      password,
      email,
    });

    await user.save();

    return toUserDto(user);
  }
  /**
   * Поиск пользователя с проверкой валидности RefreshToken
   * @param {string} refreshToken из заголовка запроса
   * @param {any} options праметры для посика в БД, обычно username
   * @returns  {UserDto} Promise single UserDto
   */
  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    options: object
  ): Promise<UserDto> {
    const user = await this.userModel.findOne(options).exec();

    if (!user) {
      throw new HttpException('Invalid credantials', HttpStatus.UNAUTHORIZED);
    }

    //если токен в БД хэширован
    // const isRefreshTokenMatching = await compare(
    //   refreshToken,
    //  user.refreshToken
    // );

    const isRefreshTokenMatching =
      refreshToken === user.refreshToken ? true : false;

    if (isRefreshTokenMatching) {
      return toUserDto(user);
    }
  }

  /**
   * Запись в БД RefreshToken
   * @param {ObjectId} _id  Идентификатор пользователя
   * @param {string} refreshToken
   * @returns Promise sinle UserDto
   */
  async saveToken(_id: Types.ObjectId, refreshToken: string): Promise<UserDto> {
    const user = await this.userModel.findById({ _id }).exec();
    if (!user) {
      throw new HttpException('Invalid credantials', HttpStatus.BAD_REQUEST);
    }
    user.refreshToken = refreshToken;
    user.save();
    return toUserDto(user);
  }

  /**
   * Удаление в БД RefreshToken
   * @param  {ObjectId} _id  Идентификатор пользователя
   * @returns Promise single UserDto with out RefreshToken
   */
  async removeToken(_id: Types.ObjectId): Promise<UserDto> {
    const user = await this.userModel.findById({ _id }).exec();
    if (!user) {
      throw new HttpException('Invalid credantials', HttpStatus.BAD_REQUEST);
    }
    user.refreshToken = null;
    user.save();
    return toUserDto(user);
  }
}
