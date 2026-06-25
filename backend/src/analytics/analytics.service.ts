import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { getInstructorCourseIds } from "../common/utils/entity.util";
import { USER_BRIEF_WITH_EMAIL_SELECT } from "../common/utils/prisma-selects.util";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getInstructorAnalytics(instructorId: string) {
    const courseIds = await getInstructorCourseIds(this.prisma, instructorId);

    const [totalStudents, totalRevenue, totalEnrollments, recentEnrollments] =
      await Promise.all([
        this.prisma.enrollment.count({
          where: { courseId: { in: courseIds } },
        }),
        this.prisma.transaction.aggregate({
          where: {
            courseId: { in: courseIds },
            status: "COMPLETED",
          },
          _sum: { amount: true },
        }),
        this.prisma.enrollment.count({
          where: { courseId: { in: courseIds } },
        }),
        this.prisma.enrollment.findMany({
          where: { courseId: { in: courseIds } },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: USER_BRIEF_WITH_EMAIL_SELECT,
            },
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
      ]);

    const courseStats = await Promise.all(
      courseIds.map(async (courseId) => {
        const [enrollmentCount, revenue] = await Promise.all([
          this.prisma.enrollment.count({
            where: { courseId },
          }),
          this.prisma.transaction.aggregate({
            where: {
              courseId,
              status: "COMPLETED",
            },
            _sum: { amount: true },
          }),
        ]);

        return {
          courseId,
          enrollments: enrollmentCount,
          revenue: Number(revenue._sum?.amount || 0),
        };
      }),
    );

    return {
      overview: {
        totalStudents,
        totalRevenue: Number(totalRevenue._sum?.amount || 0),
        totalEnrollments,
        totalCourses: courseIds.length,
      },
      courseStats,
      recentEnrollments,
    };
  }
}
