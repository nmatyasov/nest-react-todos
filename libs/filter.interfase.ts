export interface IGetTasksFilterDto {
  done?: boolean;
  keyword?: string;
  limit?: number;
  skip?: number;
}
