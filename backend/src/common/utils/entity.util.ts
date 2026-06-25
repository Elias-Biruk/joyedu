import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

export async function findCourseOrThrow(
  prisma: PrismaService,
  courseId: string,
  options?: { checkDeleted?: boolean },
) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  const checkDeleted = options?.checkDeleted ?? true;
  if (!course || (checkDeleted && course.deletedAt)) {
    throw new NotFoundException("Course not found");
  }
  return course;
}

export async function findCourseAsOwner(
  prisma: PrismaService,
  courseId: string,
  instructorId: string,
) {
  const course = await findCourseOrThrow(prisma, courseId);
  if (course.instructorId !== instructorId) {
    throw new ForbiddenException("Not your course");
  }
  return course;
}

export async function getInstructorCourseIds(
  prisma: PrismaService,
  instructorId: string,
): Promise<string[]> {
  const courses = await prisma.course.findMany({
    where: { instructorId, deletedAt: null },
    select: { id: true },
  });
  return courses.map((c) => c.id);
}

export function textSearch(fields: string[], term: string) {
  return fields.map((field) => ({
    [field]: { contains: term, mode: "insensitive" as const },
  }));
}
