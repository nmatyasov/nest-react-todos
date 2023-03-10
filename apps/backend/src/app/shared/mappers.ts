
import { TaskDto } from "@tasks/dto/task.dto";
import { TaskModel } from "@tasks/models/task.models";
import { UserDto } from "@users/dto/user.dto"
import { UserModel } from '@users/models/user.model';
import { Types } from 'mongoose';

export const toUserDto = (data: UserModel): UserDto => {
  const {_id, username, email, isEmailConfirmed} = data;

  const userDto: UserDto & { _id: Types.ObjectId } = {
    _id,
    username,
    email,
    isEmailConfirmed
  };

  return userDto;
};


export const toTaskDto = (data: TaskModel): TaskDto => {
  const {_id, title, description, done} = data;

  const taskDto: TaskDto = {
    _id, title, description, done
  };

  return taskDto;
};
