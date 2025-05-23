'use client';

import { ReactNode } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';

export default function TeamLayout({ children }: { children: ReactNode }): ReactNode {
  return <SidebarInset>{children}</SidebarInset>;
}
