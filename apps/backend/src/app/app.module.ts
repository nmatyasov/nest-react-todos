import { AuthModule } from '@auth/auth.module';
import { Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from '@tasks/tasks.module';
import { getMongoConfig } from '../config/db-connect.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RefreshSessionsModule } from '@refresh-sessions/refresh-sessions.module';

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
    AuthModule,
    TasksModule,
    RefreshSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(`Application shut down (signal: ${signal})`);
  }
}
