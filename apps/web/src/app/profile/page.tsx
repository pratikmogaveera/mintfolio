'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserDetails } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';

export default function Page() {
  const { data, isSuccess, isLoading, isError, error } = useQuery({
    queryKey: ['user-details'],
    queryFn: getUserDetails,
  });

  return (
    <div>
      <div>
        {isLoading ? (
          <Card className="mx-auto flex h-34 w-full max-w-xl flex-col">
            <Skeleton className="h-full w-full" />
          </Card>
        ) : (
          <Card className="mx-auto flex w-full max-w-xl flex-col">
            <CardHeader className="font-heading text-xl font-semibold">Profile</CardHeader>
            <Separator />
            {isSuccess ? (
              <CardContent className="flex flex-col gap-2">
                <div className="flex w-full items-center gap-3">
                  <span className="font-semibold">Email:</span>
                  <span>{data?.data?.data?.email || '-'}</span>
                </div>
                <div className="flex w-full items-center gap-3">
                  <span className="font-semibold">Username:</span>
                  <span>{data?.data?.data?.username || '-'}</span>
                </div>
                <div className="flex w-full items-center gap-3">
                  <span className="font-semibold">Joined on:</span>
                  <span>{dayjs(data?.data?.data?.created_at).format('DD MMM YYYY HH:mm') || '-'}</span>
                </div>
              </CardContent>
            ) : (
              isError && (
                <CardContent className="text-red-600">
                  {isAxiosError(error) ? error.response?.data?.message : error?.message}
                </CardContent>
              )
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
