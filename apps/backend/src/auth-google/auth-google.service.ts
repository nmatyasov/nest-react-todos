import { Injectable } from '@nestjs/common';
import { UserDto } from '@users/dto/user.dto';
import { credentialsGoogleUserDto } from './dto/credentialsUser.dto';
import { UsersService } from '@users/users.service';
import { CreateUserDto } from '@users/dto/user.create.dto';
import { generateFromEmail } from 'unique-username-generator';

@Injectable()
export class AuthGoogleService {
  constructor(private readonly usersService: UsersService) {}


  /**
   * Поиск в БД пользователя от Google 
   * Если пользователь не найдет тихо создаем нового с подтвержденной почтой
   * и возвращаем в котроллер
   * @param {credentialsGoogleUserDto} candidate регистрационная информация пользователя
   * @returns {UserDto} Promise с результатом регистрации
   */

  async validateGoogleUserOrAddNewSilent(
    candidate: credentialsGoogleUserDto
  ): Promise<UserDto> {
    const { email, avatar , username } = candidate;

    let user: UserDto = await this.usersService.findOne({ email });

    if (!user) {
      /**fake username*/
      const username = generateFromEmail(email, 5);
      const createUserDto: CreateUserDto = {
        email,
        username,
        password: `${username}${email}`,
      };

      user = await this.usersService.create(createUserDto);
      await this.usersService.markEmailAsConfirmed(email);
    }

    user = { ...user, username : username,  avatar: avatar };

    return user;
  }

/*   async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  } */
}
