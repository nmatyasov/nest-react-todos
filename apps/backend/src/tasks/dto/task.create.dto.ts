import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TaskCreateDto {
  @ApiProperty({ description: 'New task titlle', nullable: false })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'New task description', nullable: false })
  @IsNotEmpty()
  description: string;
}
