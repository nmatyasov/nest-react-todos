import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import RequestWithUser from "./requestWithUser.interface";

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
