import { useCompany } from '@/components/jrg/auth/hooks/useUser';
import { getCookie } from 'cookies-next';
import { useContext } from 'react';
import useSWR from 'swr';
import { InteractiveConfigContext } from '../InteractiveConfigContext';

export function useOldCompanies() {
  const state = useContext(InteractiveConfigContext);
  return useSWR<string[]>(
    `/companies`,
    async () => {
      return await state.sdk.getCompanies();
    },
    {
      fallbackData: [],
    },
  );
}

export function useOldInvitations(company_id?: string) {
  const state = useContext(InteractiveConfigContext);
  return useSWR<string[]>(
    company_id ? `/invitations/${company_id}` : '/invitations',
    async () => await state.sdk.getInvitations(company_id),
    {
      fallbackData: [],
    },
  );
}
export function useOldActiveCompany() {
  const state = useContext(InteractiveConfigContext);
  const { data: companyData } = useCompany();
  return useSWR<any>(
    [`/companies`, companyData?.id ?? null],
    async () => {
      const companies = await state.sdk.getCompanies();
      const user = await axios.get(`${process.env.NEXT_PUBLIC_API_URI}/v1/user`, {
        headers: {
          Authorization: getCookie('jwt'),
        },
      });
      console.log('ACTIVE COMPANY', companyData);
      console.log('ACTIVE COMPANY USER', user);
      console.log('ALL COMPANIES', companies);
      const target = companies.filter((company) => company.id === companyData.id)[0];
      console.log('ACTIVE COMPANY TARGET', target);
      console.log(
        'USER COMPANY',
        user.data.companies.filter((company) => company.id === companyData.id),
      );
      target.my_role = user.data.companies.filter((company) => company.id === companyData.id)[0].role_id;
      console.log('ACTIVE COMPANY TARGET AFTER', target);
      return target;
    },
    {
      fallbackData: [],
    },
  );
}
