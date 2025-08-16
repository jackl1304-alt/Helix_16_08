import React from 'react';
import { ResponsiveLayout } from '@/components/responsive-layout';

export default function RegulatoryUpdates() {
  return (
    <ResponsiveLayout>
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Regulatory Updates</h1>
          <p className="text-gray-600">
            Aktuelle regulatorische Änderungen und Updates werden hier angezeigt.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Diese Seite wird gerade überarbeitet und ist bald vollständig verfügbar.
          </p>
        </div>
      </div>
    </ResponsiveLayout>
  );
}