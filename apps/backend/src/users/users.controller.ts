import JwtAuthenticationGuard from "@auth/guards/jwt-authentication.guard";
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";

@Controller("users")
export class UsersController {
  @UseGuards(JwtAuthenticationGuard)
  @Get("profile")
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
