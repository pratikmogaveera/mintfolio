'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ApiResponse, type AuthResponse } from '@mintfolio/shared';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  identifier: z
    .string()
    .min(3, 'Identifier must be at least 3 characters long.')
    .max(254, 'Identifier can be at most 254 characters long.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(40, 'Password must be at most 40 characters long.'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { mutate: loginUser, isPending } = useMutation<
    { data: ApiResponse<AuthResponse>; status: number },
    Error,
    FormValues
  >({
    mutationFn: async (payload) => {
      return await apiClient.post('/auth/authenticate', payload);
    },
    onSuccess: async () => {
      toast.success('Login successful. Redirecting to home page.');
      setTimeout(() => router.push('/'), 2000);
    },
    onError: (error) => {
      if (isAxiosError(error)) toast.error(error.response?.data.message);
      else toast.error('Something went wrong while trying to login.');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onTouched' });

  const submitForm: SubmitHandler<FormValues> = (data: FormValues) => loginUser(data);
  return (
    <Card className="mx-auto my-10 w-full max-w-sm md:my-20">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your username or email to log in</CardDescription>
        <CardAction>
          <Link title="Sign Up" href="/sign-up" className="underline-offset-3 transition-all ease-in hover:underline">
            Sign Up
          </Link>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit(submitForm)}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="identifier">Email/Username</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Email or username"
                autoComplete="username"
                autoFocus
                {...register('identifier')}
              />
              {errors.identifier && <span className="text-xs text-red-400">{errors.identifier.message}</span>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-6">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
