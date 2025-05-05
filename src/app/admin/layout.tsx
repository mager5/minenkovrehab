import React from 'react';
import AdminBreadcrumbs from '@/components/AdminBreadcrumbs';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <AdminBreadcrumbs />
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
} 