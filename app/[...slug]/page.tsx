'use client';

import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
// Import any other router components you want to use
// import AnotherRouter from '../another-router-path/AnotherRouter';

interface RouterComponentProps {
  params: { slug: string[] };
  searchParams: Record<string, string | string[]>;
}

type RouterComponent = (props: RouterComponentProps) => ReactNode;

export default function CatchAllPage({ params, searchParams }: RouterComponentProps) {
  const routers: RouterComponent[] = [
    // Add any other router components here.
  ];

  for (const Router of routers) {
    const result = Router({ params, searchParams });
    if (result !== null) {
      return result;
    }
  }

  return notFound();
}
