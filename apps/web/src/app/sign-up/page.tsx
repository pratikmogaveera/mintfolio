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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { signUpUser } from '@/lib/api-client';
import { SignUpUserPayload, signUpUserSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Eye, EyeClosed } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: SignUpUserPayload) => signUpUser(payload),
    onSuccess: async () => {
      toast.success('Sign up successful. Redirecting to login page.');
      router.push('/login');
    },
    onError: (error) => {
      if (isAxiosError(error)) toast.error(error.response?.data.message);
      else toast.error('Something went wrong while trying to sign up.');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpUserPayload>({ resolver: zodResolver(signUpUserSchema), mode: 'onTouched' });

  const submitForm: SubmitHandler<SignUpUserPayload> = (data: SignUpUserPayload) => mutate(data);

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
              {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
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
              {errors.username && <span className="text-xs text-red-600">{errors.username.message}</span>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('password')}
                />
                <InputGroupAddon
                  align="inline-end"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="cursor-pointer pl-3"
                >
                  {showPassword ? <EyeClosed /> : <Eye />}
                </InputGroupAddon>
              </InputGroup>
              {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
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
