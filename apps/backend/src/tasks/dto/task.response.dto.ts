import { TaskDto } from '@tasks/dto/task.dto';
import { IsArray, IsBoolean, IsNotEmpty } from 'class-validator';


export class TaskResponseDto {
  @IsNotEmpty()
  @IsBoolean()
  status:boolean;

  @IsNotEmpty()
  count: number;

  @IsArray()
  data:TaskDto[];
}
