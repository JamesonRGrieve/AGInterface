import AuthRouter from '@/auth/Router';
import { Suspense } from 'react';

// Properly handle params as an async value in Next.js 15
export default async function UserRouter({ params }: { params: Promise<{ slug?: string[] }> | { slug?: string[] } }) {
  // Await the params to satisfy Next.js 15 requirements
  const resolvedParams = await params;

  console.log('UserRouter rendering with resolved params:', resolvedParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthRouter
        params={{
          // Pass slug without accessing it directly from the original params
          slug: resolvedParams?.slug || [],
        }}
        corePagesConfig={{
          register: {
            path: '/register',
            heading: 'Welcome, Please Register',
          },
        }}
        additionalPages={{}}
      />
    </Suspense>
  );
}
