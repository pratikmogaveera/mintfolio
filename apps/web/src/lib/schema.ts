import { z } from 'zod';

export const loginUserSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Identifier must be at least 3 characters long.')
    .max(254, 'Identifier can be at most 254 characters long.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(40, 'Password must be at most 40 characters long.'),
});

export const signUpUserSchema = z.object({
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

export type LoginUserPayload = z.infer<typeof loginUserSchema>;

export type SignUpUserPayload = z.infer<typeof signUpUserSchema>;
