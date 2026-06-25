'use client';

import { DashboardListPage } from '@/components/common/dashboard-list-page';
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function StudentNotifications() {
  return (
    <DashboardListPage
      title="Notifications"
      subtitle="Stay updated with your activities"
      queryKey="notifications"
      endpoint="/notifications?page=1&limit=20"
      emptyIcon={Bell}
      emptyTitle="No notifications"
      emptyMessage="You're all caught up! Notifications will appear here"
      skeletonLayout="list"
      renderItem={(notification: any) => (
        <Card key={notification.id} className={notification.read ? 'opacity-60' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{notification.title || 'Notification'}</h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message || 'No message content'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}
