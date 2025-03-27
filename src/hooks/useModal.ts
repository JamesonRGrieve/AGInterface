import { useRouter, usePathname } from 'next/navigation';

export function useModal() {
  const router = useRouter();
  const pathname = usePathname();

  const trigger = (path: string) => {
    router.push(`${pathname}?${path}=true`);
  };

  return { trigger };
}
