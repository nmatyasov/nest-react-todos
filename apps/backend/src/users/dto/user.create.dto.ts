import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'New user name', nullable: false })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'New user password', nullable: false })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'New user email', nullable: false })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
