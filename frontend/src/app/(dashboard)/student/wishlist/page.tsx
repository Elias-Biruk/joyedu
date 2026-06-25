'use client';

import { DashboardListPage } from '@/components/common/dashboard-list-page';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function StudentWishlist() {
  return (
    <DashboardListPage
      title="Wishlist"
      subtitle="Courses you want to enroll in"
      queryKey="wishlist"
      endpoint="/wishlist"
      emptyIcon={Heart}
      emptyTitle="Your wishlist is empty"
      emptyMessage="Save courses you're interested in by adding them to your wishlist"
      renderItem={(item: any) => (
        <Link key={item.id} href={`/courses/${item.course?.slug}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <h3 className="font-medium">{item.course?.title || 'Course'}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {item.course?.instructor?.firstName} {item.course?.instructor?.lastName}
              </p>
            </CardContent>
          </Card>
        </Link>
      )}
    />
  );
}
