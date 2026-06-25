'use client';

import { DashboardListPage } from '@/components/common/dashboard-list-page';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';

export default function StudentBookmarks() {
  return (
    <DashboardListPage
      title="Bookmarks"
      subtitle="Your bookmarked courses and lessons"
      queryKey="bookmarks"
      endpoint="/bookmarks"
      emptyIcon={Bookmark}
      emptyTitle="No bookmarks yet"
      emptyMessage="Bookmark courses and lessons to find them easily later"
      renderItem={(bookmark: any) => (
        <Link key={bookmark.id} href={`/courses/${bookmark.course?.slug}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <h3 className="font-medium">{bookmark.course?.title || 'Course'}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {bookmark.lesson?.title || 'Bookmarked item'}
              </p>
            </CardContent>
          </Card>
        </Link>
      )}
    />
  );
}
