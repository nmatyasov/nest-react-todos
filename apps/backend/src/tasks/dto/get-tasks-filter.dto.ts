import { IGetTasksFilterDto } from '@libs/filter.interfase';

export class GetTasksFilterDto implements IGetTasksFilterDto {
  done?: boolean;
  keyword?: string;
  limit?: number;
  skip?: number;
}
