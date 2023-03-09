import VerificationTokenPayload from '@auth/verificationTokenPayload.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import EmailService from './../email/email.service';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService
  ) {}

/**
 * 
 * @param email {string} user email for confirmation
 * @returns A letter will be sent
 */


  public async sendVerifictionLink(email: string):Promise<void> {
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
}
