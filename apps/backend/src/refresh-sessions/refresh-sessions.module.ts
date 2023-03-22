import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshSessionsService } from './refresh-sessions.service';
import {
  RefreshSessionModel,
  RefreshSessionSchema,
} from './models/refreshSessions.models';
import { UsersModule } from '@users/users.module';
import { RefreshSessionsController } from './refresh-sessions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RefreshSessionModel.name,
        schema: RefreshSessionSchema,
      },
    ]),
    UsersModule,
  ],

  providers: [RefreshSessionsService],
  exports: [RefreshSessionsService],
  controllers: [RefreshSessionsController],
})
export class RefreshSessionsModule {}
