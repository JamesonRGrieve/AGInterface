import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background">
      {children}
    </div>
  );
}