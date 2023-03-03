import { IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class AuthUserDto {
  @IsNotEmpty()
  readonly _id: Types.ObjectId;

  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  readonly accessToken: string;

  @IsNotEmpty()
  readonly refreshToken: string;
}
