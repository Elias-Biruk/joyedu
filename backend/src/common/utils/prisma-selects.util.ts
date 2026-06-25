export const USER_BRIEF_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatar: true,
} as const;

export const USER_BRIEF_WITH_EMAIL_SELECT = {
  ...USER_BRIEF_SELECT,
  email: true,
} as const;

export const USER_ADMIN_LIST_SELECT = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  roles: true,
  isActive: true,
  isEmailVerified: true,
  createdAt: true,
} as const;

export const COURSE_CARD_INCLUDE = {
  category: true,
  instructor: { select: USER_BRIEF_SELECT },
  _count: { select: { enrollments: true, reviews: true } },
} as const;
