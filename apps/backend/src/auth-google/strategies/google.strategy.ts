import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthGoogleService } from '../auth-google.service';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { credentialsGoogleUserDto } from '../dto/credentialsUser.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authGoogleService: AuthGoogleService
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const candidate: credentialsGoogleUserDto = {
      email: emails[0].value,
      username: `${name.givenName} ${name.familyName}`,
      avatar: photos[0].value,
    };

    const user =
      this.authGoogleService.validateGoogleUserOrAddNewSilent(candidate);
    if (!user) {
      throw new UnauthorizedException();
    }

    done(null, user);
  }
}
