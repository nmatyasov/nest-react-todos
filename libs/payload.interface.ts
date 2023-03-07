import { Types } from "mongoose";
import { ApiProperty } from '@nestjs/swagger';

export class JwtPayload {
  @ApiProperty({ description: 'User identifier', nullable: false })
  _id: Types.ObjectId;
  @ApiProperty({ description: 'User name', nullable: false })
  username: string;
}
