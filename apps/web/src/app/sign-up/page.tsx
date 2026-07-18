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
import { type ApiResponse, type User } from '@mintfolio/shared';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  email: z
    .string()
    .email('Please enter a valid email.')
    .min(3, 'Email must be at least 3 characters long.')
    .max(254, 'Email can be at most 254 characters long.'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long.')
    .max(40, 'Username can be at most 40 characters long.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(40, 'Password must be at most 40 characters long.'),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const { mutate: signUpUser, isPending } = useMutation<{ data: ApiResponse<User>; status: number }, Error, FormValues>(
    {
      mutationFn: async (payload) => {
        return await apiClient.post('/auth/register', payload);
      },
      onSuccess: async () => {
        toast.success('Sign up successful. Redirecting to login page.');
        setTimeout(() => router.push('/login'), 2000);
      },
      onError: (error) => {
        if (isAxiosError(error)) toast.error(error.response?.data.message);
        else toast.error('Something went wrong while trying to sign up.');
      },
    },
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onTouched' });

  const submitForm: SubmitHandler<FormValues> = (data: FormValues) => signUpUser(data);
  return (
    <Card className="mx-auto my-10 w-full max-w-sm md:my-20">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Enter your details to create an account</CardDescription>
        <CardAction>
          <Link title="Login" href="/login" className="underline-offset-3 transition-all ease-in hover:underline">
            Login
          </Link>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit(submitForm)}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="joe@example.com"
                autoComplete="email"
                autoFocus
                {...register('email')}
              />
              {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                autoComplete="username"
                {...register('username')}
              />
              {errors.username && <span className="text-xs text-red-400">{errors.username.message}</span>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-6">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing up...' : 'Sign Up'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
