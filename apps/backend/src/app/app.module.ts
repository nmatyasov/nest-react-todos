import { AuthModule } from '@auth/auth.module';
import { Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from '@tasks/tasks.module';
import { getMongoConfig } from '../config/db-connect.config';
import { UsersModule } from '@users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RefreshSessionsModule } from '@refresh-sessions/refresh-sessions.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthGoogleModule } from '@auth-google/auth-google.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'envs/.backend.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(__dirname, configService.get<string>('STATIC_FOLDER')),
        },
      ],
    }),
    AuthModule,
    TasksModule,
    RefreshSessionsModule,
    UsersModule,
    AuthGoogleModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(`Application shut down (signal: ${signal})`);
  }
}
