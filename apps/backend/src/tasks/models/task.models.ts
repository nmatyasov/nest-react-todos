import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ITask } from '@libs/task.interface';
import { Document, Types } from 'mongoose';
import { UserModel } from '@users/models/user.model';

@Schema({ collection: 'tasks', timestamps: true })
export class TaskModel extends Document implements ITask {
  @Prop({ required: true, trim:true })
  title: string;

  @Prop({ required: true , trim:true })
  description: string;

  @Prop({ default: false })
  done: boolean;

  @Prop({ type: Types.ObjectId, ref: UserModel.name })
  userId: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(TaskModel);
