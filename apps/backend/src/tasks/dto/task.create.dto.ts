import { IsNotEmpty } from 'class-validator';

export class TaskCreateDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
