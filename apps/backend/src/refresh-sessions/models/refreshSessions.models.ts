import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IRefreshSession } from '@libs/refresh-session.interface';
import {  Document, Types } from 'mongoose';
import { UserModel } from '@users/models/user.model';

@Schema({ collection: 'refreshSessions', timestamps: true })
export class RefreshSessionModel extends Document implements IRefreshSession {

  @Prop({ type: Types.ObjectId, ref: UserModel.name })
  userId: Types.ObjectId;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  fingerprint: string;

  @Prop({ required: true })
  expiresIn: number;
}

export const RefreshSessionSchema =
  SchemaFactory.createForClass(RefreshSessionModel);
