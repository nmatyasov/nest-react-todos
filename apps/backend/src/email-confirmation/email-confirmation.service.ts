import VerificationTokenPayload from '@auth/verificationTokenPayload.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import EmailService from '@email/email.service';
import { UsersService } from '@users/users.service';
import { UserDto } from '@users/dto/user.dto';
import { Types } from 'mongoose';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  /**
   * Отправка письма для подтверждения почты
   * @param email {string} user email for confirmation
   * @returns A letter will be sent
   */
  public async sendVerifictionLink(email: string): Promise<void> {
    const payload: VerificationTokenPayload = { email };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME'
      )}s`,
    });

    const url = `${this.configService.get(
      'EMAIL_CONFIRMATION_URL'
    )}?token=${token}`;

    const text = `Welcome to the site. To confirm the email address, click here: ${url}`;

    return this.emailService.sendMail({
      to: email,
      subject: 'Email confirmation',
      text,
    });
  }
  /**
   * Запись подтверждения в БД, что почта существует
   * @param email {string} user email
   */
  public async confirmEmail(email: string): Promise<void> {
    const user: UserDto = await this.usersService.findOne({ email });

    if (user.isEmailConfirmed) {
      throw new HttpException(
        'Email already confirmed',
        HttpStatus.BAD_REQUEST
      );
    }
    await this.usersService.markEmailAsConfirmed(email);
  }

  /**
   *  Извлечние email из токена
   * @param token {string}
   */

  public async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_VERIFICATION_TOKEN_SECRET'),
      });
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new HttpException(
        'Email confirmation error',
        HttpStatus.BAD_REQUEST
      );
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new HttpException(
          'Email confirmation token expired',
          HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException('Bad confirmation token', HttpStatus.BAD_REQUEST);
    }
  }

    /**
   * Повторная посылка подтверждения email
   * @param  {ObjectId} userId идентификатор пользователя
   */
  public async resendConfirmationLink(userId: Types.ObjectId) {
    const user = await this.usersService.findById(userId);
    if (user.isEmailConfirmed) {
      throw new HttpException('Email already confirmed', HttpStatus.BAD_REQUEST);
    }
    await this.sendVerifictionLink(user.email);
  }
}
