'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/hooks/use-auth';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';

export default function Page() {
  const { userDetails, isSuccess, isLoading, isError, error } = useAuth();

  return (
    <div>
      <div>
        {isLoading ? (
          <Card className="mx-auto flex h-34 w-full max-w-md flex-col">
            <Skeleton className="h-full w-full" />
          </Card>
        ) : (
          <Card className="mx-auto flex w-full max-w-md flex-col">
            <CardHeader className="font-heading text-xl font-semibold">Profile</CardHeader>
            <Separator />
            {isSuccess ? (
              <CardContent className="flex flex-col gap-2">
                <div className="flex w-full items-center gap-3">
                  <span className="font-semibold">Email:</span>
                  <span>{userDetails?.email || '-'}</span>
                </div>
                <div className="flex w-full items-center gap-3">
                  <span className="font-semibold">Username:</span>
                  <span>{userDetails?.username || '-'}</span>
                </div>
                <div className="flex w-full items-center gap-3">
                  <span className="font-semibold">Joined on:</span>
                  <span>{dayjs(userDetails?.created_at).format('DD MMM YYYY HH:mm') || '-'}</span>
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
