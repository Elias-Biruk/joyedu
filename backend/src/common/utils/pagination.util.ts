import { PaginatedResult } from "../dto/pagination.dto";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function getPaginationMeta(params: PaginationParams): PaginationMeta {
  const page = params.page || 1;
  const limit = params.limit || 20;
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export async function paginate<T>(
  findMany: () => Promise<T[]>,
  count: () => Promise<number>,
  params: PaginationParams,
): Promise<PaginatedResult<T>> {
  const { page, limit } = getPaginationMeta(params);
  const [data, total] = await Promise.all([findMany(), count()]);
  return new PaginatedResult(data, total, page, limit);
}
