import { AuthController } from '@auth/auth.controller';
import { LocalStrategy } from '@auth/strategies/local.strategy';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@auth/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@users/users.module';
import { AuthService } from './auth.service';
import { JwtRefreshTokenStrategy } from '@auth/strategies/jwt-refresh-token.strategy';

import { EmailConfirmationModule } from './../email-confirmation/email-confirmation.module';

const jwtFactory = {
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    signOptions: {
      expiresIn: `${configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME'
      )}ms`,
    },
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync(jwtFactory),
    EmailConfirmationModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
