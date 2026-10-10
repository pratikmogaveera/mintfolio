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
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { loginUser } from '@/lib/api-client';
import { useAuth } from '@/lib/hooks/use-auth';
import { LoginUserPayload, loginUserSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Eye, EyeClosed } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function LoginPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isSuccess, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: LoginUserPayload) => loginUser(payload),
    onSuccess: async () => {
      toast.success('Login successful.');
      await queryClient.invalidateQueries({ queryKey: ['user-details'] });
      router.push('/portfolio');
    },
    onError: (error) => {
      if (isAxiosError(error)) toast.error(error.response?.data.message);
      else toast.error('Something went wrong while trying to login.');
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserPayload>({ resolver: zodResolver(loginUserSchema), mode: 'onTouched' });

  const submitForm: SubmitHandler<LoginUserPayload> = (data: LoginUserPayload) => mutate(data);

  useEffect(() => {
    if (isSuccess) router.replace('/portfolio');
  }, [isSuccess, router]);

  if (isLoading || isSuccess) return null;

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
              {errors.identifier && <span className="text-xs text-red-600">{errors.identifier.message}</span>}
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
                  autoComplete="current-password"
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
            <div>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Controller
                    name="remember"
                    control={control}
                    render={({ field }) => (
                      <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <FieldLabel htmlFor="remember">Remember me</FieldLabel>
                </Field>
              </FieldGroup>
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
