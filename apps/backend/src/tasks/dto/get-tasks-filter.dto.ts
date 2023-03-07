import { IGetTasksFilterDto } from '@libs/filter.interfase';
import { ApiProperty } from '@nestjs/swagger';
/**
 * Параметры поиска и фильтрации задач
 *   @type{boolean} done статус задачи
 *   @type{string} keyword шаблон поиска в заголовке и описании задач
 *   @type{numeric} limit количество возвращаемых задач
 *  @type{numeric} skip количество блоков задач нужно пропустить с начала
 */
export class GetTasksFilterDto implements IGetTasksFilterDto {
  @ApiProperty({ description: 'Task status, done or not', nullable: true })
  done?: boolean;
  @ApiProperty({
    description: 'The search keyword in the title and description of the task',
    nullable: true,
  })
  keyword?: string;
  @ApiProperty({ description: 'How many tasks to choose', nullable: true })
  limit?: number;
  @ApiProperty({
    description: 'How many tasks to skip in the selection',
    nullable: true,
  })
  skip?: number;
}
