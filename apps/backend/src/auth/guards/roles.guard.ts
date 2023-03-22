import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import Role from '@users/role.enum';
import RequestWithUser from '../requestWithUser.interface';

const RolesGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<RequestWithUser>();
      const user = req.user;
      return user?.roles.includes(role);
    }
  }
  return mixin(RoleGuardMixin);
};

export default RolesGuard;
