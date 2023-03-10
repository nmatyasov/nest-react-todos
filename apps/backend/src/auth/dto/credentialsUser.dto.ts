import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class credentialsUserDto {
  /*
  @ApiProperty({ description: "User identifier", nullable: true })
  @IsOptional()
  readonly _id? :Types.ObjectId
*/
  @ApiProperty({ description: 'User email', nullable: false })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'User password', nullable: false })
  @IsNotEmpty()
  readonly password: string;
}
