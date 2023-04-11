import { Module } from '@nestjs/common';
import { AuthGoogleController } from './auth-google.controller';
import { AuthGoogleService } from './auth-google.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '@users/users.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    AuthModule,
  ],
  providers: [AuthGoogleService, GoogleStrategy],
  exports: [AuthGoogleService],
  controllers: [AuthGoogleController],
})
export class AuthGoogleModule {}
