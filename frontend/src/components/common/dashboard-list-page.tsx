'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardListPageProps<T> {
  title: string;
  subtitle: string;
  queryKey: string;
  endpoint: string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
  skeletonLayout?: 'grid' | 'list';
  skeletonCount?: number;
}

export function DashboardListPage<T extends { id: string }>({
  title,
  subtitle,
  queryKey,
  endpoint,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyMessage,
  renderItem,
  skeletonLayout = 'grid',
  skeletonCount = 4,
}: DashboardListPageProps<T>) {
  const { accessToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => api.get<T[]>(endpoint, { token: accessToken || undefined }),
    enabled: !!accessToken,
    retry: 1,
  });

  const skeletonClassName = skeletonLayout === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
    : 'space-y-4';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div>
        {isLoading ? (
          <div className={skeletonClassName}>
            {Array.from({ length: skeletonCount }, (_, i) => (
              <Skeleton key={i} className={skeletonLayout === 'grid' ? 'h-32 rounded-lg' : 'h-24 rounded-lg'} />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className={skeletonClassName}>
            {data.map((item) => renderItem(item))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <EmptyIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">{emptyTitle}</h3>
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
