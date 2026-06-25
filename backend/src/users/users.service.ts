import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { UpdateProfileDto } from "./dto/users.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { paginate, getPaginationMeta } from "../common/utils/pagination.util";
import { textSearch } from "../common/utils/entity.util";
import type { User } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user || user.deletedAt) throw new NotFoundException("User not found");
    return this.sanitize(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { firstName, lastName, bio, avatar, ...profileData } = dto;

    const userData: Record<string, unknown> = {};
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (bio !== undefined) userData.bio = bio;
    if (avatar !== undefined) userData.avatar = avatar;

    if (Object.keys(userData).length > 0) {
      await this.prisma.user.update({ where: { id: userId }, data: userData });
    }

    if (Object.keys(profileData).length > 0) {
      await this.prisma.profile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, ...profileData },
      });
    }

    return this.findById(userId);
  }

  async getPublicProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        taughtCourses: {
          where: { status: "PUBLISHED", deletedAt: null },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            difficulty: true,
          },
        },
      },
    });
    if (!user || user.deletedAt) throw new NotFoundException("User not found");
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      profile: user.profile,
      courses: user.taughtCourses,
    };
  }

  async listUsers(query: PaginationDto) {
    const { skip, take } = getPaginationMeta(query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (query.search) {
      where.OR = textSearch(
        ["firstName", "lastName", "email", "username"],
        query.search,
      );
    }

    return paginate(
      () =>
        this.prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: query.sortOrder || "desc" },
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            roles: true,
            activeRole: true,
            isEmailVerified: true,
            isActive: true,
            createdAt: true,
          },
        }),
      () => this.prisma.user.count({ where }),
      query,
    );
  }

  private sanitize(user: User & { profile?: unknown }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      roles: user.roles,
      activeRole: user.activeRole,
      isEmailVerified: user.isEmailVerified,
      subscriptionPlan: user.subscriptionPlan,
      profile: user.profile,
      createdAt: user.createdAt,
    };
  }
}
