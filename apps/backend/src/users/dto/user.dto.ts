import { IsNotEmpty, IsEmail } from 'class-validator';
import { Types } from 'mongoose';

export class UserDto {
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
