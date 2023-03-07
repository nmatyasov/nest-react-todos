import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class TaskDto {
  @ApiProperty({ description: 'Task identifier', nullable: false })
  @IsNotEmpty()
  _id: Types.ObjectId;

  @ApiProperty({ description: 'Task title', nullable: false })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Task description', nullable: false })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Task status', nullable: true })
  @IsOptional()
  done?: boolean;
}
