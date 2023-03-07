import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { TaskCreateDto } from '@tasks/dto/task.create.dto';
import { TaskUpdateDto } from '@tasks/dto/task.update.dto';
import { TaskModel } from '@tasks/models/task.models';

import { Model, Types } from 'mongoose';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { toTaskDto } from '../../src/app/shared/mappers';
import { TaskResponseDto } from '@tasks/dto/task.response.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(TaskModel.name)
    private readonly taskModel: Model<TaskModel>
  ) {}
  /**
   *  Изменение задачи
   * @param {ObjectId} userId владелец
   * @param {TaskUpdateDto} tasksUpdateDto параметры изменения
   * @returns {TaskResponseDto} Promise with the single of taskResponseDto
   */
  async updateTask(
    userId: Types.ObjectId,
    tasksUpdateDto: TaskUpdateDto
  ): Promise<TaskResponseDto> {
    const task: TaskModel = await this.taskModel.findOne({
      userId: userId,
      _id: tasksUpdateDto._id,
    });
    /*TODO Переделать под spred*/
    task.title =
      task.title === tasksUpdateDto.title ? task.title : tasksUpdateDto.title;
    task.description =
      task.description === tasksUpdateDto.description
        ? task.description
        : tasksUpdateDto.description;
    task.done =
      task.done === tasksUpdateDto.done ? task.done : tasksUpdateDto.done;
    const data = await task.save();
    const taskResponseDto: TaskResponseDto = {
      status: true,
      count: 1,
      data: [toTaskDto(data)],
    };
    return taskResponseDto;
  }
  /**
   * Удаление задачи
   * @param userId {ObjectId} Владелец задачи
   * @param taskId {ObjectId} Идентификатор задачи
   * @returns Promise<void>
   */
  async deleteTask(
    userId: Types.ObjectId,
    taskId: Types.ObjectId
  ): Promise<void> {
    await this.taskModel.findOneAndDelete({ userId: userId, _id: taskId });
  }
  /**
   * Извлечение задачи по идентификатору
   * @param userId {ObjectId} Владелец задачи
   * @param taskId {ObjectId} Идентификатор задачи
   * @returns {TaskResponseDto} Promice with the single of taskResponseDto
   */
  async getTaskById(
    userId: Types.ObjectId,
    taskId: Types.ObjectId
  ): Promise<TaskResponseDto> {
    const tasks: TaskModel[] = await this.taskModel.findOne({
      userId: userId,
      _id: taskId,
    });

    const taskResponseDto: TaskResponseDto = {
      status: !tasks.length ? false : true,
      count: tasks.length,
      data: tasks.map((task) => toTaskDto(task)),
    };
    return taskResponseDto;
  }
  /**
   * Извлечение всех задач
   * @param userId {ObjectId} Владелец задачи
   * @returns {TaskResponseDto} Promice Promice with the array of taskResponseDto
   */

  async getAllTasks(userId: Types.ObjectId): Promise<TaskResponseDto> {
    const tasks: TaskModel[] = await this.taskModel.find({ userId: userId });

    const taskResponseDto: TaskResponseDto = {
      status: !tasks.length ? false : true,
      count: tasks.length,
      data: tasks.map((task) => toTaskDto(task)),
    };
    return taskResponseDto;
  }
  /**
   * Извлечение всех задач с фильтрацией данных
   * @param userId {ObjectId} Владелец задачи
   * @param query {GetTasksFilterDto} Объект с параметрами фильтрации и пагинации
   * @returns {TaskResponseDto} Promice Promice with the array of taskResponseDto
   */

  async getAllFitredTasks(
    userId: Types.ObjectId,
    query: GetTasksFilterDto
  ): Promise<TaskResponseDto> {
    const keyword: string = query.keyword?.trim() || '';
    const limit: number = query.limit || 10;
    const skip: number = query.skip || 0;
    const done: boolean = query?.done || false;

    const filter = keyword
      ? {
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
          ],
        }
      : {};

    /* статус задачи */
    const arrDone: boolean[] = 'done' in query ? [done] : [true, false];

    const tasks: TaskModel[] = await this.taskModel
      .find(filter)
      .and([{ userId: userId }, { done: arrDone }])
      .skip(skip)
      .limit(limit);

    const taskResponseDto: TaskResponseDto = {
      status: !tasks.length ? false : true,
      count: tasks.length,
      data: tasks.map((task) => toTaskDto(task)),
    };

    return taskResponseDto;
  }

  /**
   * Создание новой задачи
   * @param userId {ObjectId} Владелец задачи
   * @param taskCreateDto {TaskCreateDto}
   * @returns {TaskResponseDto} Promice with the single of TaskResponseDto
   */
  async createTask(
    userId: Types.ObjectId,
    taskCreateDto: TaskCreateDto
  ): Promise<TaskResponseDto> {
    const { title, description } = taskCreateDto;
    const task: TaskModel = new this.taskModel({ userId, title, description });
    const data = await task.save();
    const taskResponseDto: TaskResponseDto = {
      status: true,
      count: 1,
      data: [toTaskDto(data)],
    };
    return taskResponseDto;
  }
}
