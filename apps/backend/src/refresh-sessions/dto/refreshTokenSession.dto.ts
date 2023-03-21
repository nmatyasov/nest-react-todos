import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { Types } from 'mongoose';

export class RefreshTokenSessionDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  fingerprint: string;

  @IsDate()
  @IsNotEmpty()
  expiresIn: number;

  @IsNotEmpty()
  userId: Types.ObjectId;
}