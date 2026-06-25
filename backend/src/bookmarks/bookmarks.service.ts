import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { findCourseOrThrow } from "../common/utils/entity.util";
import { COURSE_CARD_INCLUDE } from "../common/utils/prisma-selects.util";

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async getUserBookmarks(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        course: { include: COURSE_CARD_INCLUDE },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async addBookmark(userId: string, courseId: string) {
    await findCourseOrThrow(this.prisma, courseId);

    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return existing;

    return this.prisma.bookmark.create({
      data: { userId, courseId },
      include: { course: true },
    });
  }

  async removeBookmark(userId: string, courseId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!bookmark) throw new NotFoundException("Bookmark not found");
    if (bookmark.userId !== userId)
      throw new ForbiddenException("Not your bookmark");

    return this.prisma.bookmark.delete({
      where: { userId_courseId: { userId, courseId } },
    });
  }
}
