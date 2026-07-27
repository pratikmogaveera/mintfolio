import { User } from '@mintfolio/shared';
import { useQuery } from '@tanstack/react-query';
import { getUserDetails } from '../api-client';

interface UseAuthHook {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  userDetails: User | undefined;
  error: Error | null;
}

export function useAuth(): UseAuthHook {
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: ['user-details'],
    queryFn: getUserDetails,
    select(data) {
      return data.data.data as User;
    },
  });

  return { userDetails: data, isSuccess, isLoading, isError, error };
}
