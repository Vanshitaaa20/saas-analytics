import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { CreateInviteDto } from './dto/invite.dto';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class OrgService {
  constructor(private prisma: PrismaService) {}

  async createOrg(userId: string, dto: CreateOrgDto) {
    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: dto.name },
      });

      await tx.membership.create({
        data: {
          userId,
          orgId: org.id,
          role: Role.OWNER,
        },
      });

      return org;
    });
  }

  async createInvite(orgId: string, dto: CreateInviteDto) {
    const token = crypto.randomBytes(32).toString('hex');
    return this.prisma.invite.create({
      data: {
        email: dto.email,
        role: dto.role,
        orgId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async acceptInvite(userId: string, token: string) {
    const invite = await this.prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.expiresAt < new Date()) {
      throw new ForbiddenException('Invalid or expired invite');
    }

    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.membership.create({
        data: { userId, orgId: invite.orgId, role: invite.role },
      });
      await tx.invite.delete({ where: { id: invite.id } });
      return membership;
    });
  }

  async getMembers(userId: string, orgId: string) {
    const requesterMembership = await this.prisma.membership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return this.prisma.membership.findMany({
      where: { orgId },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async getMyOrgs(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: { org: true },
    });
    return memberships.map((m) => ({
      id: m.org.id,
      name: m.org.name,
      role: m.role,
    }));
  }
}
