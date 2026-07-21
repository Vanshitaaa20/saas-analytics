import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, ctx.getHandler());
    if (!requiredRoles) return true; // no @Roles() on this route = no restriction

    const req = ctx.switchToHttp().getRequest();
    const userId = req.user.userId;
    const orgId = req.params.orgId;

    const membership = await this.prisma.membership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });

    if (!membership || !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role for this action');
    }
    return true;
  }
}