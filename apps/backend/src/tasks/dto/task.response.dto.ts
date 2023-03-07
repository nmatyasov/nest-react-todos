import { ApiProperty } from '@nestjs/swagger';
import { TaskDto } from '@tasks/dto/task.dto';
import { IsArray, IsBoolean, IsNotEmpty } from 'class-validator';

export class TaskResponseDto {
  @ApiProperty({ description: 'Response status', nullable: false })
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: 'Number of tasks in the response',
    nullable: false,
  })
  @IsNotEmpty()
  count: number;

  @ApiProperty({ description: 'Array of TaskDto ', type: TaskDto })
  @IsArray()
  data: TaskDto[];
}
