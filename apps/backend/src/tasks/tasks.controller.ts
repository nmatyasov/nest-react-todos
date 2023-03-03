import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskCreateDto } from '@tasks/dto/task.create.dto';
import { Types } from 'mongoose';
import { TaskUpdateDto } from '@tasks/dto/task.update.dto';

import { GetUser } from '@auth/get-user.decorator';
import { UserDto } from '@users/dto/user.dto';
import { ParseObjectIdPipe } from './../app/shared/pipes';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import JwtAuthenticationGuard from './../auth/guards/jwt-authentication.guard';
import { TaskResponseDto } from '@tasks/dto/task.response.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Post()
  async createTask(
    @GetUser() user: UserDto,
    @Body(ValidationPipe) taskCreateDto: TaskCreateDto
  ) {
    return await this.tasksService.createTask(user._id, taskCreateDto);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  async getAllTasks(
    @GetUser() user: UserDto,
    @Query() filterDto: GetTasksFilterDto
  ): Promise<TaskResponseDto> {
    if (Object.keys(filterDto).length) {
      return await this.tasksService.getAllFitredTasks(user._id, filterDto);
    } else {
      return await this.tasksService.getAllTasks(user._id);
    }
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  async getTask(
    @GetUser() user: UserDto,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId
  ): Promise<TaskResponseDto> {
    return await this.tasksService.getTaskById(user._id, id);
  }

  @HttpCode(204)
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  async deleteTask(
    @GetUser() user: UserDto,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId
  ): Promise<void> {
    return await this.tasksService.deleteTask(user._id, id);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put()
  async updateTask(
    @GetUser() user: UserDto,
    @Body(ValidationPipe) tasksUpdateDto: TaskUpdateDto
  ): Promise<TaskResponseDto> {
    return await this.tasksService.updateTask(user._id, tasksUpdateDto);
  }
}
