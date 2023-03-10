import { EmailModule } from '@email/email.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@users/users.module';
import { EmailConfirmationController } from './email-confirmation.controller';
import { EmailConfirmationService } from './email-confirmation.service';


const optionsFactory = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    service: configService.get<string>('EMAIL_SERVICE'),
    user: configService.get<string>('EMAIL_USER'),
    password: configService.get<string>('EMAIL_PASSWORD'),
  }),
}


@Module({
  imports: [
    ConfigModule,
    EmailModule.registerAsync(optionsFactory),
    JwtModule.register({}),
    UsersModule,
  ],

  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
  controllers: [EmailConfirmationController],
})
export class EmailConfirmationModule {}
