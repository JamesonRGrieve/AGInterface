'use client';

import { SidebarPage } from '@/appwrapper/SidebarPage';
import { useUser } from '@/auth/hooks/useUser';
import Training from '@/interface/Settings/training';
export default function TrainingPage() {
  const { data: user, isLoading } = useUser();

  // Get role_id from the primary company or the first company if no primary is set
  const userRoleId = user?.teams?.find((company: any) => company.primary)?.role_id ?? user?.companies?.[0]?.role_id;

  const isAdmin = !isLoading && userRoleId && userRoleId < 3;

  return (
    <SidebarPage title='Training'>
      <Training />
    </SidebarPage>
  );
}
