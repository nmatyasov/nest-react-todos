import { AuthUserDto } from "@auth/dto/auth-login.dto";
import { Types } from "mongoose";
import { RegistrationStatus } from "@libs/registartion-status.interface";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "@users/dto/user.create.dto";
import { UsersService } from "@users/users.service";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "@libs/payload.interface";
import { LoginUserDto } from "@auth/dto/auth.dto";
import { UserDto } from "@users/dto/user.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: "user registered",
    };

    try {
      await this.usersService.create(userDto);
    } catch (err) {
      status = {
        success: false,
        message: err,
      };
    }
    return status;
  }

  async getCookieWithJwtToken(userId: Types.ObjectId): Promise<AuthUserDto> {
    const user = await this.usersService.findById(userId);

    const payload: JwtPayload = { _id: user._id, username: user.username };
    const tokens = await this.getTokens(payload);

    await this.usersService.saveToken(user._id, tokens.refreshToken);

    return {
      _id: user._id,
      username: user.username,
      ...tokens,
    };
  }

  async getCookieWithJwtAccessToken(
    userId: Types.ObjectId
  ): Promise<AuthUserDto> {
    console.log(userId);
    const user = await this.usersService.findById(userId);

    const payload: JwtPayload = { _id: user._id, username: user.username };
    const tokens = await this.getTokens(payload);

    return {
      _id: user._id,
      username: user.username,
      ...tokens,
    };
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: Types.ObjectId
  ) {
    return await this.usersService.getUserIfRefreshTokenMatches(refreshToken, {
      _id: userId,
    });
  }

  async validateUser(email: string, password: string): Promise<UserDto> {
    const loginUserDto: LoginUserDto = { email, password };
    const user = await this.usersService.findByLogin(loginUserDto);

    return user;
  }

  async validateUserById(userId: Types.ObjectId): Promise<UserDto> {
    const user = await this.usersService.findById(userId);

    return user;
  }

  async logout(userId: Types.ObjectId): Promise<void> {
    await this.usersService.removeToken(userId);
  }

  private async getTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          payload,
        },
        {
          secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
          expiresIn: `${this.configService.get(
            "JWT_ACCESS_TOKEN_EXPIRATION_TIME"
          )}s`,
        }
      ),
      this.jwtService.signAsync(
        {
          payload,
        },
        {
          secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
          expiresIn: `${this.configService.get(
            "JWT_REFRESH_TOKEN_EXPIRATION_TIME"
          )}s`,
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
