import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { findCourseOrThrow } from "../common/utils/entity.util";
import { COURSE_CARD_INCLUDE } from "../common/utils/prisma-selects.util";

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getUserWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        course: { include: COURSE_CARD_INCLUDE },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async addToWishlist(userId: string, courseId: string) {
    await findCourseOrThrow(this.prisma, courseId);

    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return existing;

    return this.prisma.wishlist.create({
      data: { userId, courseId },
      include: { course: true },
    });
  }

  async removeFromWishlist(userId: string, courseId: string) {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!item) throw new NotFoundException("Wishlist item not found");
    if (item.userId !== userId)
      throw new ForbiddenException("Not your wishlist item");

    return this.prisma.wishlist.delete({
      where: { userId_courseId: { userId, courseId } },
    });
  }
}
