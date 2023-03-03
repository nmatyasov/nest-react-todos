import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class TaskDto {
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
  
  @IsOptional()
  done?: boolean;
}
