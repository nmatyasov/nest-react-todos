import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class AuthUserDto {
  @ApiProperty({ description: 'User identifier', nullable: false })
  @IsNotEmpty()
  readonly _id: Types.ObjectId;

  @ApiProperty({ description: 'User name', nullable: false })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ description: 'Access token', nullable: false })
  @IsNotEmpty()
  readonly accessToken: string;

  @ApiProperty({ description: 'Refresh token', nullable: false })
  @IsNotEmpty()
  readonly refreshToken: string;

  @ApiProperty({ description: 'Array user roles', nullable: false })
  roles: string[];
}
