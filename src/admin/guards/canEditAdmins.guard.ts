import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Roles } from '../definitions/Roles';
import { Admin } from '../Models/admin.model';

@Injectable()
export class CanEditAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const admin: Admin = request.user;

    return matchRoles(admin.roles);
  }
}

function matchRoles(roles: Roles[]): boolean {
  return roles.includes(Roles.super_admin);
}
