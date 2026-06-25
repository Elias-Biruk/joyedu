'use client';

import { DashboardListPage } from '@/components/common/dashboard-list-page';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Download } from 'lucide-react';

export default function StudentCertificates() {
  return (
    <DashboardListPage
      title="Certificates"
      subtitle="Your earned certificates"
      queryKey="certificates"
      endpoint="/certificates"
      emptyIcon={Trophy}
      emptyTitle="No certificates yet"
      emptyMessage="Complete courses to earn certificates"
      renderItem={(certificate: any) => (
        <Card key={certificate.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{certificate.course?.title || 'Course'}</h3>
                <p className="text-sm text-muted-foreground">
                  Completed on {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-sm text-primary hover:underline">
              <Download className="h-4 w-4" />
              Download Certificate
            </button>
          </CardContent>
        </Card>
      )}
    />
  );
}
