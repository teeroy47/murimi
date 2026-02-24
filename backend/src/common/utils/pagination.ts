export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export function toPagination(q: PaginationQuery) {
  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 20)));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
