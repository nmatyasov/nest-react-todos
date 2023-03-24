import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class JwtPayload {
  @ApiProperty({ description: 'User identifier', nullable: false })
  _id: Types.ObjectId;
  @ApiProperty({ description: 'User name', nullable: false })
  username: string;
  @ApiProperty({ description: 'Refresh token for mobile app', nullable: true })
  refreshToken?: string;
  @ApiProperty({ description: 'Array user roles', nullable: false })
  roles: string[];
  @ApiProperty({ description: 'User avatar', nullable: true })
  avatar?: string;
}
