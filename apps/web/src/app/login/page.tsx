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
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Link from 'next/link';
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submitForm: SubmitHandler<FormValues> = async (data: FormValues) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/authenticate`, data);
      toast.success('Login successful.');
    } catch (error) {
      if (axios.isAxiosError(error)) toast.error(error.response?.data.message);
      else toast.error('Something went wrong while trying to login.');
    }
  };
  return (
    <Card className="mx-auto my-10 w-full max-w-sm md:my-20">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your username or email to log in</CardDescription>
        <CardAction>
          <Link title="Sign Up" href="/sign-up">
            Sign Up
          </Link>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit(submitForm)}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="identifier">Email/Username</Label>
              <Input id="identifier" type="text" placeholder="Email or username" {...register('identifier')} />
              {errors.identifier && <span className="text-xs text-red-400">{errors.identifier.message}</span>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" placeholder="********" {...register('password')} />
              {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-6">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
