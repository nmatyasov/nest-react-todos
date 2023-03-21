import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { Types } from 'mongoose';

export class UserDto {
  @ApiProperty({ description: 'User identifier', nullable: false })
  @IsNotEmpty()
  _id: Types.ObjectId;

  @ApiProperty({ description: 'User name', nullable: false })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'User email', nullable: false })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User email confirmed status', nullable: true })
  isEmailConfirmed: boolean;

}
