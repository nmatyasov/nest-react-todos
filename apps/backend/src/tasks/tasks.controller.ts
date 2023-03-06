import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Post()
  @ApiOperation({
    summary: 'Create new task',
  })
  @ApiQuery({
    name: 'taskCreateDto',
    required: true,
    description: 'Task create Dto',
    type: TaskCreateDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async createTask(
    @GetUser() user: UserDto,
    @Body(ValidationPipe) taskCreateDto: TaskCreateDto
  ): Promise<TaskResponseDto> {
    return await this.tasksService.createTask(user._id, taskCreateDto);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  @ApiOperation({
    summary: 'Returns all available or filtered tasks for the user',
  })
  @ApiQuery({
    name: 'filterDto',
    required: false,
    description: 'Filter',
    type: GetTasksFilterDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: TaskResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Returns a task with specified id' })
  @ApiParam({ name: 'id', required: true, description: 'Task identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getTask(
    @GetUser() user: UserDto,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId
  ): Promise<TaskResponseDto> {
    return await this.tasksService.getTaskById(user._id, id);
  }

  @HttpCode(204)
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Deletes a task with specified id' })
  @ApiParam({ name: 'id', required: true, description: 'Task identifier' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async deleteTask(
    @GetUser() user: UserDto,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId
  ): Promise<void> {
    return await this.tasksService.deleteTask(user._id, id);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put()
  @ApiOperation({ summary: 'Updates a task with specified id' })
  @ApiParam({
    name: 'TaskUpdateDto',
    required: true,
    description: 'Task tasksUpdateDto',
    type: TaskUpdateDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async updateTask(
    @GetUser() user: UserDto,
    @Body(ValidationPipe) tasksUpdateDto: TaskUpdateDto
  ): Promise<TaskResponseDto> {
    return await this.tasksService.updateTask(user._id, tasksUpdateDto);
  }
}
